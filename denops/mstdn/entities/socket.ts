import * as methods from "./methods.ts";

import { User } from "./user.ts";

import {
  Announcement,
  Conversation,
  Notification,
  Reaction,
  Status,
} from "./masto.d.ts";
import { isString } from "https://deno.land/x/unknownutil@v3.10.0/mod.ts#^.ts";
import camelcaseKeys from "npm:camelcase-keys";

/**
 * 非同期取得のストリームの種類
 */
export type Stream =
  | "public"
  | "public:media"
  | "public:local"
  | "public:local:media"
  | "public:remote"
  | "public:remote:media"
  | "hashtag"
  | "hashtag:local"
  | "user"
  | "user:notification"
  | "list"
  | "direct";

/**
 * ストリーム開通時に送信するデータ
 */
export interface Subscription<T extends Stream> {
  type: "subscribe" | "unsubscribe";
  stream: T;
  list: T extends "list" ? string : undefined;
  tag: T extends "hashtag" | "hashtag:local" ? string : undefined;
}

/**
 * タイムラインの種類
 */
export interface Method {
  get subscription(): Subscription<Stream>;
  get endpoint(): string;
}

/**
 * mstdn://* 形式のUriをパースしたもの
 */
export interface Uri {
  method: Method;
  user: User;
}

/**
 * mstdn://* 形式のUri文字列をパースする
 */
export function parseUri(uri: string): Uri {
  if (!uri.startsWith("mstdn://")) {
    throw new Error("parse error");
  }
  const [userString, ...queryString] = uri.slice(8).split("/");
  const user = new User(userString);
  let method: Method | undefined = undefined;
  switch (queryString[0]) {
    case "public":
      if (queryString[1] === "local" || queryString[1] === "remote") {
        method = new methods.Public({
          only_media: queryString[2] === "media",
          mode: queryString[1],
        });
      } else {
        method = new methods.Public({
          only_media: queryString[1] === "media",
          mode: null,
        });
      }
      break;
    case "hashtag":
      if (queryString[1] === "local") {
        method = new methods.HashTag({
          local: true,
          tag: queryString[2],
        });
      } else {
        method = new methods.HashTag({
          local: false,
          tag: queryString[1],
        });
      }
      break;
    case "user":
      break;
    case "list":
      break;
    case "direct":
      break;
    default:
      break;
  }
  if (method) {
    return {
      user,
      method,
    };
  }
  throw new Error(`method "${queryString[0]}" is unimplemented`);
}

interface StreamResponse {
  stream: Stream[];
  event: Event;
  payload: string;
}

type Event =
  | "update"
  | "delete"
  | "notification"
  | "filters_changed"
  | "conversation"
  | "announcement"
  | "announcement.reaction"
  | "announcement.delete"
  | "status.update";

type MstdnSocketOptions = {
  onError?:
    | undefined
    | ((ev: globalThis.Event | ErrorEvent | string) => unknown);
  onCreatingSocket?: undefined | (() => unknown);
  onOpen?: undefined | (() => unknown);
  onUpdate?: undefined | ((status: Status) => unknown);
  onDelete?: undefined | ((id: string) => unknown);
  onNotification?: undefined | ((notification: Notification) => unknown);
  onFiltersChanged?: undefined | (() => unknown);
  onConversation?: undefined | ((conversation: Conversation) => unknown);
  onAnnouncement?: undefined | ((announcement: Announcement) => unknown);
  onAnnouncementReaction?: undefined | ((reaction: Reaction) => unknown);
  onAnnouncementDelete?: undefined | ((id: string) => unknown);
  onStatusUpdate?: undefined | ((status: Status) => unknown);
};

export class MstdnSocket {
  private uri: Uri;
  private opts: MstdnSocketOptions;

  private sock: WebSocket;
  private readonly _urls: {
    readonly wss: URL;
    readonly rest: URL;
  };
  get urls() {
    return this._urls;
  }
  get status(): "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" {
    switch (this.sock.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
    }
    throw new Error("unreachable");
  }
  constructor(
    uri: Uri | string,
    opts: MstdnSocketOptions = {},
    // protocols?: string | string[] | undefined,
  ) {
    this.uri = isString(uri) ? parseUri(uri) : uri;
    this.opts = opts;
    const wss = new URL(`wss://${this.uri.user.server}/api/v1/streaming`);
    wss.searchParams.set("access_token", this.uri.user.token);
    wss.searchParams.set("stream", this.uri.method.subscription.stream);
    const rest = new URL(
      `https://${this.uri.user.server}/${this.uri.method.endpoint}`,
    );
    this._urls = {
      wss,
      rest,
    };
    this.sock = this.createSocket();
  }
  /**
   * 手動で取得する
   */
  public async fetch(
    opts: {
      before?: Status | undefined;
    } = {},
  ) {
    const url = this.urls.rest;
    if (opts.before) {
      url.searchParams.set("max_id", opts.before.id);
    }
    const data = await (
      await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.uri.user.token}`,
        },
      })
    ).text();
    const parsedData = JSON.parse(data);
    if (parsedData.error) {
      if (this.opts.onError) {
        this.opts.onError(`${parsedData.error}`);
      }
      return [];
    }
    const statuses: Status[] = camelcaseKeys(parsedData);
    if (this.opts.onUpdate) {
      for (const status of statuses) {
        await this.opts.onUpdate(status);
      }
    }
    return statuses;
  }
  private createSocket(): WebSocket {
    if (this.opts.onCreatingSocket) {
      this.opts.onCreatingSocket();
    }
    const socket = new WebSocket(this.urls.wss);
    socket.onopen = async () => {
      if (this.opts.onOpen) {
        await this.opts.onOpen();
      }
    };
    socket.onerror = (ev) => {
      this.close();
      if (this.opts.onError) {
        this.opts.onError(ev);
      }
    };
    socket.onmessage = (ev) => {
      const data: StreamResponse = camelcaseKeys(JSON.parse(ev.data));
      switch (data.event) {
        case "update": {
          if (this.opts.onUpdate) {
            const status: Status = camelcaseKeys(JSON.parse(data.payload));
            this.opts.onUpdate(status);
          }
          break;
        }
        case "delete": {
          if (this.opts.onDelete) {
            const id: string = data.payload;
            this.opts.onDelete(id);
          }
          break;
        }
        case "notification": {
          if (this.opts.onNotification) {
            const notification: Notification = camelcaseKeys(
              JSON.parse(data.payload),
            );
            this.opts.onNotification(notification);
          }
          break;
        }
        case "filters_changed":
          if (this.opts.onFiltersChanged) {
            this.opts.onFiltersChanged();
          }
          break;
        case "conversation": {
          if (this.opts.onConversation) {
            const conersation: Conversation = camelcaseKeys(
              JSON.parse(data.payload),
            );
            this.opts.onConversation(conersation);
          }
          break;
        }
        case "announcement": {
          if (this.opts.onAnnouncement) {
            const announcement: Announcement = camelcaseKeys(
              JSON.parse(data.payload),
            );
            this.opts.onAnnouncement(announcement);
          }
          break;
        }
        case "announcement.reaction": {
          if (this.opts.onAnnouncementReaction) {
            const reaction: Reaction = camelcaseKeys(JSON.parse(data.payload));
            this.opts.onAnnouncementReaction(reaction);
          }
          break;
        }
        case "announcement.delete": {
          if (this.opts.onAnnouncementDelete) {
            const id: string = data.payload;
            this.opts.onAnnouncementDelete(id);
          }
          break;
        }
        case "status.update": {
          if (this.opts.onStatusUpdate) {
            const status: Status = camelcaseKeys(JSON.parse(data.payload));
            this.opts.onStatusUpdate(status);
          }
          break;
        }
      }
    };
    return socket;
  }
  public reconnect() {
    this.close();
    this.sock = this.createSocket();
  }
  public close() {
    this.sock.close();
  }
}

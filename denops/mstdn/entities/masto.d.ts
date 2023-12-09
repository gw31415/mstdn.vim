// MIT License
//
// Copyright (c) 2022 Ryō Igarashi
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { CustomError } from "https://esm.sh/v135/ts-custom-error@3.3.1/dist/custom-error.d.ts";

declare class MastoUnexpectedError extends CustomError {}

declare class MastoDeserializeError extends CustomError {
  readonly contentType: string;
  readonly data: unknown;
  constructor(
    message: string,
    contentType: string,
    data: unknown,
    options?: ErrorOptions,
  );
}

export type MastoErrorType =
  | "ERR_BLOCKED"
  | "ERR_UNREACHABLE"
  | "ERR_TAKEN"
  | "ERR_RESERVED"
  | "ERR_ACCEPTED"
  | "ERR_BLANK"
  | "ERR_INVALID"
  | "ERR_TOO_LONG"
  | "ERR_TOO_SHORT"
  | "ERR_INCLUSION";
export interface MastoHttpErrorDetail {
  readonly error: MastoErrorType;
  readonly description: string;
}
export type MastoHttpErrorDetails = Record<
  string,
  readonly MastoHttpErrorDetail[]
>;
export interface MastoHttpErrorProps {
  readonly statusCode: number;
  readonly message: string;
  readonly description?: string;
  readonly details?: MastoHttpErrorDetails;
  readonly additionalProperties?: Record<string, unknown>;
}
declare class MastoHttpError extends CustomError {
  readonly statusCode: number;
  readonly description?: string;
  readonly details?: MastoHttpErrorDetails;
  readonly additionalProperties?: Record<string, unknown>;
  constructor(props: MastoHttpErrorProps, errorOptions?: ErrorOptions);
}

declare class MastoInvalidArgumentError extends CustomError {}

declare class MastoTimeoutError extends CustomError {}

declare class MastoWebSocketError extends CustomError {
  constructor(message: string, options?: ErrorOptions);
}

export type Encoding = "none" | "json" | "multipart-form" | "querystring";

export interface HttpMetaParams<T extends Encoding = "none"> {
  readonly encoding?: T;
  readonly requestInit?: Omit<RequestInit, "body" | "method">;
}

export type LogType = "debug" | "info" | "warn" | "error";

/**
 * Represents a custom emoji.
 * @see https://docs.joinmastodon.org/entities/CustomEmoji/
 */
export interface CustomEmoji {
  /** The name of the custom emoji. */
  shortcode: string;
  /** A link to the custom emoji. */
  url: string;
  /** A link to a static copy of the custom emoji. */
  staticUrl: string;
  /** Whether this Emoji should be visible in the picker or unlisted. */
  visibleInPicker: boolean;
  /** Used for sorting custom emoji in the picker. */
  category?: string | null;
}

/**
 * Represents a custom user role that grants permissions.
 * @see https://docs.joinmastodon.org/entities/Role/
 */
export interface Role {
  /** The ID of the Role in the database. */
  id: number;
  /** The name of the role. */
  name: string;
  /** The hex code assigned to this role. If no hex code is assigned, the string will be empty */
  color: string;
  /** An index for the role’s position. The higher the position, the more priority the role has over other roles. */
  position: number;
  /** A bitmask that represents the sum of all permissions granted to the role. */
  permissions: number;
  /** Whether the role is publicly visible as a badge on user profiles. */
  highlighted: boolean;
  /** The date that the role was created. */
  createdAt: string;
  /** The date that the role was updated. */
  updatedAt: string;
}

/**
 * Represents an application that interfaces with the REST API to access accounts or post statuses.
 * @see https://docs.joinmastodon.org/entities/application/
 */
export interface Application {
  /** The name of your application. */
  name: string;
  /** The website associated with your application. */
  website?: string | null;
  /** Used for Push Streaming API. Returned with POST /api/v1/apps. Equivalent to PushSubscription#server_key */
  vapidKey?: string | null;
}
export interface Client$3 extends Application {
  /** Client ID key, to be used for obtaining OAuth tokens */
  clientId?: string | null;
  /** Client secret key, to be used for obtaining OAuth tokens */
  clientSecret?: string | null;
}

/**
 * Represents a keyword that, if matched, should cause the filter action to be taken.
 * @see https://docs.joinmastodon.org/entities/FilterKeyword/
 */
export interface FilterKeyword {
  /** The ID of the FilterKeyword in the database. */
  id: string;
  /** The phrase to be matched against. */
  keyword: string;
  /** Should the filter consider word boundaries? See [implementation guidelines](https://docs.joinmastodon.org/api/guidelines/#filters) for filters. */
  wholeWord: boolean;
}

/**
 * Represents a status ID that, if matched, should cause the filter action to be taken.
 * @see https://docs.joinmastodon.org/entities/FilterStatus/
 */
export interface FilterStatus {
  /** The ID of the FilterStatus in the database. */
  id: string;
  /** The ID of the filtered Status in the database. */
  statusId: string;
}

export type FilterContext$1 =
  | "home"
  | "notifications"
  | "public"
  | "thread"
  | "account";
export type FilterAction = "warn" | "hide";
/**
 * Represents a user-defined filter for determining which statuses should not be shown to the user.
 * @see https://docs.joinmastodon.org/entities/filter/
 */
export interface Filter$1 {
  /** The ID of the filter in the database. */
  id: string;
  /** A title given by the user to name the filter. */
  title: string;
  /** The contexts in which the filter should be applied. */
  context: FilterContext$1[];
  /** When the filter should no longer be applied */
  expiresAt?: string | null;
  /**
   * The action to be taken when a status matches this filter.
   *
   * `warn` = show a warning that identifies the matching filter by title, and allow the user to expand the filtered status. This is the default (and unknown values should be treated as equivalent to warn).
   *
   * `hide` = do not show this status if it is received
   */
  filterAction: FilterAction;
  /** The keywords grouped under this filter. */
  keywords: FilterKeyword[];
  /** The statuses grouped under this filter. */
  statuses: FilterStatus[];
}

/**
 * Represents a filter whose keywords matched a given status.
 * @see https://docs.joinmastodon.org/entities/FilterResult/
 */
export interface FilterResult {
  /** The filter that was matched. */
  filter: Filter$1;
  /** The keyword within the filter that was matched. */
  keywordMatches: string[] | null;
  /** The status ID within the filter that was matched. */
  statusMatches: string[] | null;
}

export type MediaAttachmentType =
  | "image"
  | "video"
  | "gifv"
  | "audio"
  | "unknown";
export interface MediaAttachmentMetaImage {
  width: number;
  height: number;
  size: string;
  aspect: number;
}
export interface MediaAttachmentMetaVideo {
  width: number;
  height: number;
  frameRate: string;
  duration: number;
  bitrate: number;
  aspect: number;
}
export interface MediaAttachmentMetaFocus {
  x: number;
  y: number;
}
export interface MediaAttachmentMetaColors {
  background: string;
  foreground: string;
  accent: string;
}
export interface MediaAttachmentMeta {
  small?: MediaAttachmentMetaImage | MediaAttachmentMetaVideo | null;
  original?: MediaAttachmentMetaImage | MediaAttachmentMetaVideo | null;
  focus?: MediaAttachmentMetaFocus | null;
  colors?: MediaAttachmentMetaColors | null;
}
/**
 * Represents a file or media MediaAttachment that can be added to a status.
 * @see https://docs.joinmastodon.org/entities/MediaAttachment/
 */
export interface MediaAttachment {
  /** The ID of the MediaAttachment in the database. */
  id: string;
  /** The type of the MediaAttachment. */
  type: MediaAttachmentType;
  /** The location of the original full-size MediaAttachment. */
  url?: string | null;
  /** The location of a scaled-down preview of the MediaAttachment. */
  previewUrl: string;
  /** The location of the full-size original MediaAttachment on the remote website. */
  remoteUrl?: string | null;
  /** Remote version of previewUrl */
  previewRemoteUrl?: string | null;
  /** A shorter URL for the MediaAttachment. */
  textUrl?: string | null;
  /** Metadata returned by Paperclip. */
  meta?: MediaAttachmentMeta | null;
  /**
   * Alternate text that describes what is in the media MediaAttachment,
   * to be used for the visually impaired or when media MediaAttachments do not load.
   */
  description?: string | null;
  /**
   * A hash computed by the BlurHash algorithm,
   * for generating colorful preview thumbnails when media has not been downloaded yet.
   */
  blurhash?: string | null;
}

export interface PollOption {
  /** The text value of the poll option. String. */
  title: string;
  /** The number of received votes for this option. Number, or null if results are not published yet. */
  votesCount?: number;
  /** Custom emoji to be used for rendering poll options. */
  emojis: CustomEmoji[];
}
/**
 * Represents a poll attached to a status.
 * @see https://docs.joinmastodon.org/entities/poll/
 */
export interface Poll {
  /** The ID of the poll in the database. */
  id: string;
  /** When the poll ends. */
  expiresAt?: string | null;
  /** Is the poll currently expired? */
  expired: boolean;
  /** Does the poll allow multiple-choice answers? */
  multiple: boolean;
  /** How many votes have been received. */
  votesCount: number;
  /** How many unique accounts have voted on a multiple-choice poll. */
  votersCount?: number | null;
  /** When called with a user token, has the authorized user voted? */
  voted?: boolean;
  /**
   * When called with a user token, which options has the authorized user chosen?
   * Contains an array of index values for options.
   */
  ownVotes?: number[] | null;
  /** Possible answers for the poll. */
  options: PollOption[];
}

/**
 * Represents daily usage history of a hashtag.
 */
export interface TagHistory$1 {
  /** UNIX timestamp on midnight of the given day. */
  day: string;
  /** the counted usage of the tag within that day. */
  uses: string;
  /** the total of accounts using the tag within that day. */
  accounts: string;
}
/**
 * Represents a hashtag used within the content of a status.
 * @see https://docs.joinmastodon.org/entities/tag/
 */
export interface Tag$1 {
  /** The value of the hashtag after the # sign. */
  name: string;
  /** A link to the hashtag on the instance. */
  url: string;
  /** Usage statistics for given days. */
  history?: TagHistory$1[] | null;
  /** Whether the current token’s authorized user is following this tag. */
  following?: boolean | null;
}

export type PreviewCardType = "link" | "photo" | "video" | "rich";
/**
 * Represents a rich preview card that is generated using OpenGraph tags from a URL.
 * @see https://docs.joinmastodon.org/entities/PreviewCard
 */
export interface PreviewCard {
  /** Location of linked resource. */
  url: string;
  /** Title of linked resource. */
  title: string;
  /** Description of preview. */
  description: string;
  /** The type of the preview card. */
  type: PreviewCardType;
  /** Blurhash */
  blurhash: string;
  /** The author of the original resource. */
  authorName?: string | null;
  /** A link to the author of the original resource. */
  authorUrl?: string | null;
  /** The provider of the original resource. */
  providerName?: string | null;
  /** A link to the provider of the original resource. */
  providerUrl?: string | null;
  /** HTML to be used for generating the preview card. */
  html?: string | null;
  /** Width of preview, in pixels. */
  width?: number | null;
  /** Height of preview, in pixels. */
  height?: number | null;
  /** Preview thumbnail. */
  image?: string | null;
  /** Used for photo embeds, instead of custom `html`. */
  embedUrl: string;
}
export interface TrendLink extends PreviewCard {
  history: TagHistory$1[];
}

/**
 * Represents a mention of a user within the content of a status.
 * @see https://docs.joinmastodon.org/entities/mention/
 */
export interface StatusMention {
  /** The account id of the mentioned user. */
  id: string;
  /** The username of the mentioned user. */
  username: string;
  /** The location of the mentioned user's profile. */
  url: string;
  /**
   * The WebFinger acct: URI of the mentioned user.
   * Equivalent to username for local users, or `username@domain` for remote users.
   */
  acct: string;
}
export type StatusVisibility = "public" | "unlisted" | "private" | "direct";
/**
 * Represents a status posted by an account.
 * @see https://docs.joinmastodon.org/entities/status/
 */
export interface Status {
  /** ID of the status in the database. */
  id: string;
  /** URI of the status used for federation. */
  uri: string;
  /** The date when this status was created. */
  createdAt: string;
  /** Timestamp of when the status was last edited. */
  editedAt: string | null;
  /** The account that authored this status. */
  account: Account$1;
  /** HTML-encoded status content. */
  content: string;
  /** Visibility of this status. */
  visibility: StatusVisibility;
  /** Is this status marked as sensitive content? */
  sensitive: boolean;
  /** Subject or summary line, below which status content is collapsed until expanded. */
  spoilerText: string;
  /** Media that is attached to this status. */
  mediaAttachments: MediaAttachment[];
  /** The application used to post this status. */
  application: Application;
  /** Mentions of users within the status content. */
  mentions: StatusMention[];
  /** Hashtags used within the status content. */
  tags: Tag$1[];
  /** Custom emoji to be used when rendering status content. */
  emojis: CustomEmoji[];
  /** How many boosts this status has received. */
  reblogsCount: number;
  /** How many favourites this status has received. */
  favouritesCount: number;
  /** If the current token has an authorized user: The filter and keywords that matched this status. */
  filtered?: FilterResult[];
  /** How many replies this status has received. */
  repliesCount: number;
  /** A link to the status's HTML representation. */
  url?: string | null;
  /** ID of the status being replied. */
  inReplyToId?: string | null;
  /** ID of the account being replied to. */
  inReplyToAccountId?: string | null;
  /** The status being reblogged. */
  reblog?: Status | null;
  /** The poll attached to the status. */
  poll?: Poll | null;
  /** Preview card for links included within status content. */
  card?: PreviewCard | null;
  /** Primary language of this status. */
  language?: string | null;
  /**
   * Plain-text source of a status. Returned instead of `content` when status is deleted,
   * so the user may redraft from the source text without the client having
   * to reverse-engineer the original text from the HTML content.
   */
  text?: string | null;
  /** Have you favourited this status? */
  favourited?: boolean | null;
  /** Have you boosted this status? */
  reblogged?: boolean | null;
  /** Have you muted notifications for this status's conversation? */
  muted?: boolean | null;
  /** Have you bookmarked this status? */
  bookmarked?: boolean | null;
  /** Have you pinned this status? Only appears if the status is pin-able. */
  pinned?: boolean | null;
}

/**
 * Represents display or publishing preferences of user's own account.
 * Returned as an additional entity when verifying and updated credentials, as an attribute of Account.
 * @see https://docs.joinmastodon.org/entities/source/
 */
export interface AccountSource {
  /** Profile bio. */
  note: string;
  /** Metadata about the account. */
  fields: AccountField;
  /** The default post privacy to be used for new statuses. */
  privacy?: StatusVisibility | null;
  /** Whether new statuses should be marked sensitive by default. */
  sensitive?: boolean | null;
  /** The default posting language for new statuses. */
  language: string | null;
  /** The number of pending follow requests. */
  followRequestsCount?: number | null;
}
/**
 * Represents a profile field as a name-value pair with optional verification.
 */
export interface AccountField {
  /** The key of a given field's key-value pair. */
  name: string;
  /** The value associated with the `name` key. */
  value: string;
  /** Timestamp of when the server verified a URL value for a rel="me” link. */
  verifiedAt?: string | null;
}
/**
 * Represents a user of Mastodon and their associated profile.
 * @see https://docs.joinmastodon.org/entities/account/
 */
export interface Account$1 {
  /** The account id */
  id: string;
  /** The username of the account, not including domain */
  username: string;
  /** The WebFinger account URI. Equal to `username` for local users, or `username@domain` for remote users. */
  acct: string;
  /** The location of the user's profile page. */
  url: string;
  /** The profile's display name. */
  displayName: string;
  /** The profile's bio / description. */
  note: string;
  /** An image icon that is shown next to statuses and in the profile. */
  avatar: string;
  /** A static version of the `avatar`. Equal to avatar if its value is a static image; different if `avatar` is an animated GIF. */
  avatarStatic: string;
  /** An image banner that is shown above the profile and in profile cards. */
  header: string;
  /** A static version of the header. Equal to `header` if its value is a static image; different if `header` is an animated GIF. */
  headerStatic: string;
  /** Whether the account manually approves follow requests. */
  locked: boolean;
  /** Additional metadata attached to a profile as name-value pairs. */
  fields: AccountField[];
  /** Custom emoji entities to be used when rendering the profile. If none, an empty array will be returned. */
  emojis: CustomEmoji[];
  /** Boolean to indicate that the account performs automated actions */
  bot: boolean;
  /** Indicates that the account represents a Group actor. */
  group: boolean;
  /** Whether the account has opted into discovery features such as the profile directory. */
  discoverable?: boolean | null;
  /** Whether the local user has opted out of being indexed by search engines. */
  noindex?: boolean | null;
  /** Indicates that the profile is currently inactive and that its user has moved to a new account. */
  moved?: Account$1 | null;
  /** An extra entity returned when an account is suspended. **/
  suspended?: boolean | null;
  /** An extra attribute returned only when an account is silenced. If true, indicates that the account should be hidden behind a warning screen. */
  limited?: boolean | null;
  /** When the account was created. */
  createdAt: string;
  /** Time of the last status posted */
  lastStatusAt: string;
  /** How many statuses are attached to this account. */
  statusesCount: number;
  /** The reported followers of this profile. */
  followersCount: number;
  /** The reported follows of this profile. */
  followingCount: number;
  /** Roles that have been granted to this account. */
  roles: Pick<Role, "id" | "name" | "color">[];
  /** https://github.com/mastodon/mastodon/pull/23591 */
  memorial?: boolean | null;
}
/**
 * @see https://docs.joinmastodon.org/entities/Account/#CredentialAccount
 */
export interface AccountCredentials extends Account$1 {
  /**
   * Note the extra `source` property, which is not visible on accounts other than your own.
   * Also note that plain-text is used within `source` and HTML is used for their
   * corresponding properties such as `note` and `fields`.
   */
  source: AccountSource;
  /** The role assigned to the currently authorized user. */
  role: Role;
}

/**
 * Represents an IP address associated with a user.
 * @see https://docs.joinmastodon.org/entities/Admin_Ip/
 */
export interface Ip {
  /** The IP address. */
  ip: string;
  /** The timestamp of when the IP address was last used for this account. */
  usedAt: string;
}

/**
 * Admin-level information about a given account.
 * @see https://docs.joinmastodon.org/entities/admin-account/
 */
export interface Account {
  /** The ID of the account in the database. */
  id: string;
  /** The username of the account. */
  username: string;
  /** The domain of the account. */
  domain?: string | null;
  /** When the account was first discovered. */
  createdAt: string;
  /** The email address associated with the account. */
  email: string;
  /** The IP address last used to login to this account. */
  ip?: string | null;
  /** All known IP addresses associated with this account. */
  ips: Ip[];
  /** The locale of the account. */
  locale: string;
  /** The reason given when requesting an invite (for instances that require manual approval of registrations) */
  inviteRequest?: string | null;
  /** The current role of the account. */
  role: Role;
  /** Whether the account has confirmed their email address. */
  confirmed: boolean;
  /** Whether the account is currently approved. */
  approved: boolean;
  /** Whether the account is currently disabled. */
  disabled: boolean;
  /** Whether the account is currently silenced. */
  silenced: boolean;
  /** Whether the account is currently suspended. */
  suspended: boolean;
  /** Boolean. Filter for accounts force-marked as sensitive? */
  sensitized: boolean;
  /** User-level information about the account. */
  account: Account$1;
  /** The ID of the application that created this account. */
  createdByApplicationId?: string | null;
  /** The ID of the account that invited this user */
  invitedByAccountId?: string | null;
}

export interface CanonicalEmailBlock {
  /** The ID of email block in the database. */
  id: string;
  /** The hash to test against. */
  canonicalEmailHash: string;
}

export type CohortFrequency = "day" | "month";
export interface CohortData {
  /** The timestamp for the start of the bucket, at midnight. */
  date: string;
  /** The percentage rate of users who registered in the specified `period` and were active for the given `date` bucket. */
  rate: number;
  /** How many users registered in the specified `period` and were active for the given `date` bucket. */
  value: number;
}
/**
 * Represents a retention metric.
 */
export interface Cohort {
  /** The timestamp for the start of the period, at midnight. */
  period: string;
  /** The size of the bucket for the returned data. */
  frequency: CohortFrequency;
  /** Retention data for users who registered during the given period. */
  data: CohortData[];
}

export interface DimensionData {
  /** The unique keystring for this data item. */
  key: string;
  /** A human-readable key for this data item. */
  humanKey: string;
  /** The value for this data item. */
  value: string;
  /** The units associated with this data item’s value, if applicable. */
  unit?: string | null;
  /** A human-readable formatted value for this data item. */
  humanValue?: string | null;
}
export type DimensionKey =
  | "languages"
  | "sources"
  | "servers"
  | "space_usage"
  | "software_versions"
  | "tag_servers"
  | "tag_languages"
  | "instance_accounts"
  | "instance_languages";
/**
 * Represents qualitative data about the server.
 * @see https://docs.joinmastodon.org/entities/Admin_Dimension/
 */
export interface Dimension {
  /** The unique keystring for the requested dimension. */
  key: DimensionKey;
  /** The data available for the requested dimension. */
  data: DimensionData[];
}

export interface DomainAllow {
  /** The ID of the domain allow in the database. */
  id: string;
  /** The domain of the domain allow in the database. */
  domain: string;
  /** The create date of the domain allow in the database. */
  createdAt: string;
}

export type DomainBlockSeverity = "silence" | "suspend" | "noop";
export interface DomainBlock {
  /** The ID of the domain block in the database. */
  id: string;
  /** The domain of the domain block in the database. */
  domain: string;
  /** The create date of the domain block in the database. */
  createdAt: string;
  /** The date of the application that created this account. */
  severity: DomainBlockSeverity;
  /** The reject media of the domain. */
  rejectMedia: boolean;
  /** The reject report of the domain. */
  rejectReposts: boolean;
  /** The private comment of the domain. */
  privateComment?: string | null;
  /** The public comment of the domain. */
  publicComment?: string | null;
  /** The obfuscate of the domain block. */
  obfuscate: boolean;
}

export interface EmailDomainBlockHistory {
  /** UNIX timestamp on midnight of the given day. */
  day: string;
  /** The counted accounts signup attempts using that email domain within that day. */
  accounts: string;
  /** The counted IP signup attempts of that email domain within that day. */
  uses: string;
}
export interface EmailDomainBlock {
  /** The ID of the email domain block in the database. */
  id: string;
  /** The domain of the email domain block in the database. */
  domain: string;
  /** The create date of the email domain block in the database. */
  createdAt: string;
  /** The history of the email domain block in the database. */
  history: EmailDomainBlockHistory[];
}

export type IpBlockSeverity =
  | "sign_up_requires_approval"
  | "sign_up_block"
  | "no_access";
export interface IpBlock {
  /** The ID of the domain allow in the database. */
  id: string;
  /** The IP address and prefix to block. */
  ip: string;
  /** The policy to apply to this IP range. */
  severity: IpBlockSeverity;
  /** The reason for this IP block. */
  comment: string;
  /** The create date of the ip block. */
  createdAt: string;
  /** The number of seconds in which this IP block will expire. */
  expiresAt: number | null;
}

export interface MeasureData {
  /** Midnight on the requested day in the time period. */
  date: string;
  /** The numeric value for the requested measure. */
  value: string;
}
/** @see https://docs.joinmastodon.org/entities/Admin_Measure/#key */
export type MeasureKey =
  | "active_users"
  | "new_users"
  | "interactions"
  | "opened_reports"
  | "resolved_reports"
  | "tag_accounts"
  | "tag_uses"
  | "tag_servers"
  | "instance_accounts"
  | "instance_media_attachments"
  | "instance_reports"
  | "instance_statuses"
  | "instance_follows"
  | "instance_followers";
/**
 * Represents quantitative data about the server.
 * @see https://docs.joinmastodon.org/entities/Admin_Measure
 */
export interface Measure {
  /** The unique keystring for the requested measure. */
  key: MeasureKey;
  /** The units associated with this data item’s value, if applicable. */
  unit?: string | null;
  /** The numeric total associated with the requested measure. */
  total: string;
  /** A human-readable formatted value for this data item. */
  humanValue?: string;
  /** The numeric total associated with the requested measure, in the previous period. Previous period is calculated by subtracting the start_at and end_at dates, then offsetting both start and end dates backwards by the length of the time period. */
  previousTotal?: string;
  /** The data available for the requested measure, split into daily buckets. */
  data: MeasureData[];
}

export type ReportCategory = "spam" | "violation" | "legal" | "other";
/**
 * Reports filed against users and/or statuses, to be taken action on by moderators.
 * @see https://docs.joinmastodon.org/entities/Report/
 */
export interface Report$1 {
  /** The ID of the report in the database. */
  id: string;
  /** Whether an action was taken yet. */
  actionTaken: boolean;
  /** When an action was taken against the report. */
  actionTakenAt?: string | null;
  /**
   * The generic reason for the report.
   *
   * `spam` = Unwanted or repetitive content
   *
   * `violation` = A specific rule was violated
   *
   * `other` = Some other reason
   */
  category: ReportCategory;
  /** The reason for the report. */
  comment: string;
  /** Whether the report was forwarded to a remote domain */
  forwarded: boolean;
  /** When the report was created */
  createdAt: string;
  /** IDs of statuses that have been attached to this report for additional context. */
  statusIds?: string[] | null;
  /** IDs of the rules that have been cited as a violation by this report. */
  ruleIds?: string[] | null;
  /** The account that was reported. */
  targetAccount: Account$1;
}

export interface Rule {
  id: string;
  text: string;
}

/**
 * Admin-level information about a filed report.
 * @see https://docs.joinmastodon.org/entities/admin-report/
 */
export interface Report {
  /** The ID of the report in the database. */
  id: string;
  /** The action taken to resolve this report. */
  actionTaken: boolean;
  /** When an action was taken, if this report is currently resolved. */
  actionTakenAt?: string | null;
  /** The category under which the report is classified */
  category: ReportCategory;
  /** An optional reason for reporting. */
  comment: string;
  /** Whether a report was forwarded to a remote instance. */
  forwarded: boolean;
  /** The time the report was filed. */
  createdAt: string;
  /** The time of last action on this report. */
  updatedAt: string;
  /** The account which filed the report. */
  account: Account$1;
  /** The account being reported. */
  targetAccount: Account$1;
  /** The account of the moderator assigned to this report. */
  assignedAccount?: Account$1 | null;
  /** The action taken by the moderator who handled the report. */
  actionTakenByAccount: Account$1;
  /** Statuses attached to the report, for context. */
  statuses: Status[];
  /** Rules attached to the report, for context. */
  rules: Rule[];
}

export interface TagHistory {
  day: string;
  accounts: string;
  uses: string;
}
/**
 * @see https://docs.joinmastodon.org/entities/Tag/#admin
 */
export interface Tag {
  /** The ID of the Tag in the database. */
  id: string;
  name: string;
  url: string;
  history: TagHistory[];
  /** Whether the hashtag has been approved to trend. */
  trendable: boolean;
  /** Whether the hashtag has not been disabled from auto-linking. */
  usable: boolean;
  /** Whether the hashtag has not been reviewed yet to approve or deny its trending. */
  requiresReview: boolean;
}

export type index$7_Account = Account;
export type index$7_CanonicalEmailBlock = CanonicalEmailBlock;
export type index$7_Cohort = Cohort;
export type index$7_CohortData = CohortData;
export type index$7_CohortFrequency = CohortFrequency;
export type index$7_Dimension = Dimension;
export type index$7_DimensionData = DimensionData;
export type index$7_DimensionKey = DimensionKey;
export type index$7_DomainAllow = DomainAllow;
export type index$7_DomainBlock = DomainBlock;
export type index$7_DomainBlockSeverity = DomainBlockSeverity;
export type index$7_EmailDomainBlock = EmailDomainBlock;
export type index$7_EmailDomainBlockHistory = EmailDomainBlockHistory;
export type index$7_Ip = Ip;
export type index$7_IpBlock = IpBlock;
export type index$7_IpBlockSeverity = IpBlockSeverity;
export type index$7_Measure = Measure;
export type index$7_MeasureData = MeasureData;
export type index$7_MeasureKey = MeasureKey;
export type index$7_Report = Report;
export type index$7_Tag = Tag;
export type index$7_TagHistory = TagHistory;
declare namespace index$7 {
  export type {
    index$7_Account as Account,
    index$7_CanonicalEmailBlock as CanonicalEmailBlock,
    index$7_Cohort as Cohort,
    index$7_CohortData as CohortData,
    index$7_CohortFrequency as CohortFrequency,
    index$7_Dimension as Dimension,
    index$7_DimensionData as DimensionData,
    index$7_DimensionKey as DimensionKey,
    index$7_DomainAllow as DomainAllow,
    index$7_DomainBlock as DomainBlock,
    index$7_DomainBlockSeverity as DomainBlockSeverity,
    index$7_EmailDomainBlock as EmailDomainBlock,
    index$7_EmailDomainBlockHistory as EmailDomainBlockHistory,
    index$7_Ip as Ip,
    index$7_IpBlock as IpBlock,
    index$7_IpBlockSeverity as IpBlockSeverity,
    index$7_Measure as Measure,
    index$7_MeasureData as MeasureData,
    index$7_MeasureKey as MeasureKey,
    index$7_Report as Report,
    index$7_Tag as Tag,
    index$7_TagHistory as TagHistory,
  };
}

/**
 * Represents a weekly bucket of instance activity.
 * @see https://docs.joinmastodon.org/entities/activity/
 */
export interface Activity {
  /** Midnight at the first day of the week. */
  week: string;
  /** Statuses created since the week began. */
  statuses: string;
  /** User logins since the week began. */
  logins: string;
  /** User registrations since the week began. */
  registrations: string;
}

export interface Reaction {
  name: string;
  count: number;
  me: boolean;
  url: string;
  staticUrl: string;
}

export interface AnnouncementAccount {
  id: string;
  username: string;
  url: string;
  acct: string;
}
export interface AnnouncementStatus {
  id: string;
  url: string;
}
export interface Announcement {
  id: string;
  content: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  publishedAt: string;
  updatedAt: string;
  mentions: AnnouncementAccount[];
  statuses: AnnouncementStatus[];
  tags: Tag$1[];
  emojis: CustomEmoji[];
  reactions: Reaction[];
}

/**
 * Represents the tree around a given status. Used for reconstructing threads of statuses.
 * @see https://docs.joinmastodon.org/entities/context/
 */
export interface Context {
  /** Parents in the thread. */
  ancestors: Status[];
  /** Children in the thread. */
  descendants: Status[];
}

/**
 * Represents a conversation with "direct message" visibility.
 * @see https://docs.joinmastodon.org/entities/conversation/
 */
export interface Conversation {
  /** Local database ID of the conversation. */
  id: string;
  /** Participants in the conversation. */
  accounts: Account$1[];
  /** Is the conversation currently marked as unread? */
  unread: boolean;
  /** The last status in the conversation, to be used for optional display. */
  lastStatus?: Status | null;
}

/**
 * Represents a subset of your follows who also follow some other user.
 * @see https://docs.joinmastodon.org/entities/FamiliarFollowers/
 */
export interface FamiliarFollowers {
  /** The ID of the Account in the database. */
  id: string;
  /** Accounts you follow that also follow this account. */
  accounts: Account$1[];
}

/**
 * Represents a hashtag that is featured on a profile.
 * @see https://docs.joinmastodon.org/entities/featuredtag/
 */
export interface FeaturedTag {
  /** The internal ID of the featured tag in the database. */
  id: string;
  /** The name of the hashtag being featured. */
  name: string;
  /** The number of authored statuses containing this hashtag */
  statusesCount: number;
  /** The timestamp of the last authored status containing this hashtag. */
  lastStatusAt?: string | null;
}

export type FilterContext =
  | "home"
  | "notifications"
  | "public"
  | "thread"
  | "account";
/**
 * Represents a user-defined filter for determining which statuses should not be shown to the user.
 * @see https://docs.joinmastodon.org/entities/filter/
 */
export interface Filter {
  /** The ID of the filter in the database. */
  id: string;
  /** The text to be filtered. */
  phrase: string;
  /** The contexts in which the filter should be applied. */
  context: FilterContext[];
  /** When the filter should no longer be applied */
  expiresAt?: string | null;
  /** Should matching entities in home and notifications be dropped by the server? */
  irreversible: boolean;
  /** Should the filter consider word boundaries? */
  wholeWord: boolean;
}

/**
 * Represents a proof from an external identity provider.
 * @see https://docs.joinmastodon.org/entities/identityproof/
 */
export interface IdentityProof {
  /** The name of the identity provider. */
  provider: string;
  /** The account owner's username on the identity provider's service. */
  providerUsername: string;
  /** The account owner's profile URL on the identity provider. */
  profileUrl: string;
  /** A link to a statement of identity proof, hosted by the identity provider. */
  proofUrl: string;
  /** The name of the identity provider. */
  updatedAt: string;
}

export interface InstanceStatusesConfiguration$1 {
  maxCharacters: number;
  maxMediaAttachments: number;
  charactersReservedPerUrl: number;
}
export interface InstanceMediaAttachmentsConfiguration$1 {
  supportedMimeTypes: string[];
  imageSizeLimit: number;
  imageMatrixLimit: number;
  videoSizeLimit: number;
  videoFrameRateLimit: number;
  videoMatrixLimit: number;
}
export interface InstancePollsConfiguration$1 {
  maxOptions: number;
  maxCharactersPerOption: number;
  minExpiration: number;
  maxExpiration: number;
}
export interface InstanceAccountsConfiguration$1 {
  maxFeaturedTags: number;
}
/**
 * @see https://github.com/mastodon/mastodon/pull/16485
 */
export interface InstanceConfiguration$1 {
  statuses: InstanceStatusesConfiguration$1;
  mediaAttachments: InstanceMediaAttachmentsConfiguration$1;
  polls: InstancePollsConfiguration$1;
  accounts: InstanceAccountsConfiguration$1;
}
/**
 * Represents the software instance of Mastodon running on this domain.
 * @see https://docs.joinmastodon.org/entities/instance/
 */
export interface Instance$1 {
  /** The domain name of the instance. */
  uri: string;
  /** The title of the website. */
  title: string;
  /** Admin-defined description of the Mastodon site. */
  description: string;
  /** A shorter description defined by the admin. */
  shortDescription: string;
  /** An email that may be contacted for any inquiries. */
  email: string;
  /** The version of Mastodon installed on the instance. */
  version: string;
  /** Primary languages of the website and its staff. */
  languages: string[];
  /** Whether registrations are enabled. */
  registrations: boolean;
  /** Whether registrations require moderator approval. */
  approvalRequired: boolean;
  /** URLs of interest for clients apps. */
  urls: InstanceURLs;
  /** Statistics about how much information the instance contains. */
  stats: InstanceStats;
  /** Whether invitation in enabled */
  invitesEnabled: boolean;
  /** List various values like file size limits and supported mime types */
  configuration: InstanceConfiguration$1;
  /** Banner image for the website. */
  thumbnail?: string | null;
  /** A user that can be contacted, as an alternative to `email`. */
  contactAccount?: Account$1 | null;
  rules?: Rule[] | null;
}
export interface InstanceURLs {
  /** WebSockets address for push streaming. String (URL). */
  streamingApi: string;
}
export interface InstanceStats {
  /** Users registered on this instance. Number. */
  userCount: number;
  /** Statuses authored by users on instance. Number. */
  statusCount: number;
  /** Domains federated with this instance. Number. */
  domainCount: number;
}

export type ListRepliesPolicy = "followed" | "list" | "none";
/**
 * Represents a list of some users that the authenticated user follows.
 * @see https://docs.joinmastodon.org/entities/list/
 */
export interface List {
  /** The internal database ID of the list. */
  id: string;
  /** The user-defined title of the list. */
  title: string;
  /**
   * Which replies should be shown in the list.
   *
   * `followed` = Show replies to any followed user
   *
   * `list` = Show replies to members of the list
   *
   * `none` = Show replies to no one
   */
  repliesPolicy: ListRepliesPolicy;
  /** https://github.com/mastodon/mastodon/pull/22048/files */
  exclusive: boolean;
}

export interface MarkerItem {
  /** The ID of the most recently viewed entity. */
  lastReadId: string;
  /** The timestamp of when the marker was set. */
  updatedAt: string;
  /** Used for locking to prevent write conflicts. */
  version: number;
}
export type MarkerTimeline = "home" | "notifications";
/**
 * Represents the last read position within a user's timelines.
 * @see https://docs.joinmastodon.org/entities/marker/
 */
export type Marker = {
  [key in MarkerTimeline]: MarkerItem;
};

export interface BaseNotification<T> {
  /** The id of the notification in the database. */
  id: string;
  /** The type of event that resulted in the notification. */
  type: T;
  /** The timestamp of the notification. */
  createdAt: string;
  /** The account that performed the action that generated the notification. */
  account: Account$1;
}
export type BaseNotificationPlain<T> = BaseNotification<T> & {
  /** Status that was the object of the notification, e.g. in mentions, reblogs, favourites, or polls. */
  status?: undefined | null;
  /** Report that was the object of the notification. Attached when type of the notification is admin.report. */
  report?: undefined | null;
};
export type BaseNotificationWithStatus<T> = BaseNotification<T> & {
  /** Status that was the object of the notification, e.g. in mentions, reblogs, favourites, or polls. */
  status: Status;
  /** Report that was the object of the notification. Attached when type of the notification is admin.report. */
  report?: undefined | null;
};
export type BaseNotificationWithReport<T> = BaseNotification<T> & {
  /** Status that was the object of the notification, e.g. in mentions, reblogs, favourites, or polls. */
  status?: undefined | null;
  /** Report that was the object of the notification. Attached when type of the notification is admin.report. */
  report: Report$1;
};
/**
 * Someone mentioned you in their status
 */
export type MentionNotification = BaseNotificationWithStatus<"mention">;
/**
 * Someone you enabled notifications for has posted a status
 */
export type StatusNotification = BaseNotificationWithStatus<"status">;
/**
 * Someone boosted one of your statuses
 */
export type ReblogNotification = BaseNotificationWithStatus<"reblog">;
/**
 * Someone followed you
 */
export type FollowNotification = BaseNotificationPlain<"follow">;
/**
 * Someone requested to follow you
 */
export type FollowRequestNotification = BaseNotificationPlain<"follow_request">;
/**
 * Someone favourited one of your statuses
 */
export type FavouriteNotification = BaseNotificationWithStatus<"favourite">;
/**
 * A poll you have voted in or created has ended
 */
export type PollNotification = BaseNotificationWithStatus<"poll">;
/**
 * A status you interacted with has been edited
 */
export type UpdateNotification = BaseNotificationWithStatus<"update">;
/**
 * Someone signed up (optionally sent to admins)
 */
export type AdminSignUpNotification = BaseNotificationPlain<"admin.sign_up">;
export type AdminReportNotification =
  BaseNotificationWithReport<"admin.report">;
/**
 * Represents a notification of an event relevant to the user.
 * @see https://docs.joinmastodon.org/entities/notification
 */
export type Notification =
  | MentionNotification
  | StatusNotification
  | ReblogNotification
  | FollowNotification
  | FollowRequestNotification
  | FavouriteNotification
  | PollNotification
  | UpdateNotification
  | AdminSignUpNotification
  | AdminReportNotification;
export type NotificationType = Notification["type"];

export type PreferenceReadingExpandMedia = "show_all" | "hide_all" | "default";
/**
 * Represents a user's preferences.
 * @see https://docs.joinmastodon.org/entities/preferences/
 */
export interface Preference {
  /** Default visibility for new posts. Equivalent to Source#privacy. */
  "posting:default:visibility": StatusVisibility;
  /** Default sensitivity flag for new posts. Equivalent to Source#sensitive. */
  "posting:default:sensitive": boolean;
  /** Default language for new posts. Equivalent to Source#language */
  "posting:default:language": string;
  /** Whether media attachments should be automatically displayed or blurred/hidden. */
  "reading:expand:media": PreferenceReadingExpandMedia;
  /** Whether CWs should be expanded by default. */
  "reading:expand:spoilers": boolean;
  /** Whether GIFs should be automatically played */
  "reading:autoplay:gifs": boolean;
}

/**
 * Represents the relationship between accounts, such as following / blocking / muting / etc.
 * @see https://docs.joinmastodon.org/entities/relationship/
 */
export interface Relationship {
  /** The account id. */
  id: string;
  /** Are you following this user? */
  following: boolean;
  /** Are you receiving this user's boosts in your home timeline? */
  showingReblogs: boolean;
  /** Have you enabled notifications for this user? */
  notifying: boolean;
  /** Which languages are you following from this user? */
  languages: string[];
  /** Are you followed by this user? */
  followedBy: boolean;
  /** Are you blocking this user? */
  blocking: boolean;
  /** Is this user blocking you? */
  blockedBy: boolean;
  /** Are you muting this user? */
  muting: boolean;
  /** Are you muting notifications from this user? */
  mutingNotifications: boolean;
  /** Do you have a pending follow request for this user? */
  requested: boolean;
  /** Are you blocking this user's domain? */
  domainBlocking: boolean;
  /** Are you featuring this user on your profile? */
  endorsed: boolean;
  /** Personal note for this account */
  note?: string | null;
  /** Whether the represented user has requested to follow you */
  requestedBy: boolean;
}

export interface StatusParams
  extends Pick<
    Status,
    "id" | "inReplyToId" | "sensitive" | "spoilerText" | "visibility"
  > {
  /** Content of the status */
  text: string;
  /** IDs of media attachments */
  mediaIds?: string[] | null;
  /** ID of the application */
  applicationId: string;
}
/**
 * Represents a status that will be published at a future scheduled date.
 * @see https://docs.joinmastodon.org/entities/scheduledstatus/
 */
export interface ScheduledStatus {
  /** ID of the scheduled status in the database. */
  id: string;
  /** ID of the status in the database. */
  scheduledAt: string;
  /** Parameters of the status */
  params: StatusParams;
  /** Media attachments */
  mediaAttachments: MediaAttachment[];
}

/**
 * Represents the results of a search.
 * @see https://docs.joinmastodon.org/entities/results/
 */
export interface Search$1 {
  /** Accounts which match the given query */
  accounts: Account$1[];
  /** Statuses which match the given query */
  statuses: Status[];
  /** Hashtags which match the given query */
  hashtags: string[];
}

export type StatusEdit = Pick<
  Status,
  | "content"
  | "spoilerText"
  | "sensitive"
  | "createdAt"
  | "account"
  | "mediaAttachments"
  | "emojis"
>;

export interface StatusSource {
  id: string;
  text: string;
  spoilerText: string;
}

export type SuggestionSource = "staff" | "past_interactions" | "global";
/**
 * Represents a suggested account to follow and an associated reason for the suggestion.
 * @see https://docs.joinmastodon.org/entities/Suggestion/
 */
export interface Suggestion {
  /**
   * The reason this account is being suggested.
   * `staff` = This account was manually recommended by your administration team
   * `past_interactions` = You have interacted with this account previously
   * `global` = This account has many reblogs, favourites, and active local followers within the last 30 days
   */
  source: SuggestionSource;
  /**
   * The account being recommended to follow.
   */
  account: Account$1;
}

/**
 * Represents an OAuth token used for authenticating with the API and performing actions.
 * @see https://docs.joinmastodon.org/entities/token/
 */
export interface Token {
  /** An OAuth token to be used for authorization. */
  accessToken: string;
  /** The OAuth token type. Mastodon uses Bearer tokens. */
  tokenType: string;
  /** The OAuth scopes granted by this token, space-separated. */
  scope: string;
  /** When the token was generated. */
  createdAt: number;
}

export interface Translation {
  /** The translated text of the status. */
  content: string;
  /** The language of the source text, as auto-detected by the machine translation provider. */
  detectedLanguageSource: string;
  /** The service that provided the machine translation. */
  provider: string;
}

export type WebPushSubscriptionPolicy =
  | "all"
  | "followed"
  | "follower"
  | "none";
/**
 * Represents a subscription to the push streaming server.
 * @see https://docs.joinmastodon.org/entities/WebPushSubscription/
 */
export interface WebPushSubscription {
  /** The id of the push subscription in the database. */
  id: string;
  /** Where push alerts will be sent to. */
  endpoint: string;
  /** The streaming server's VAPID key. */
  serverKey: string;
  /** Which alerts should be delivered to the `endpoint`. */
  alerts: WebPushSubscriptionAlerts;
  policy: WebPushSubscriptionPolicy;
}
export interface WebPushSubscriptionAlerts {
  /** Receive a push notification when someone has followed you? Boolean. */
  follow: boolean;
  /** Receive a push notification when a status you created has been favourited by someone else? Boolean. */
  favourite: boolean;
  /** Receive a push notification when someone else has mentioned you in a status? Boolean. */
  reblog: boolean;
  /** Receive a push notification when a status you created has been boosted by someone else? Boolean. */
  mention: boolean;
  /** Receive a push notification when a poll you voted in or created has ended? Boolean. */
  poll: boolean;
  /** Receive new subscribed account notifications? Defaults to false. */
  status: boolean;
  /** Receive status edited notifications? Defaults to false. */
  update: boolean;
  admin: {
    /** Receive new user signup notifications? Defaults to false. Must have a role with the appropriate permissions. */
    signUp: boolean;
    /** Receive new report notifications? Defaults to false. Must have a role with the appropriate permissions. */
    report: boolean;
  };
}

export type index$6_AccountCredentials = AccountCredentials;
export type index$6_AccountField = AccountField;
export type index$6_AccountSource = AccountSource;
export type index$6_Activity = Activity;
export type index$6_AdminReportNotification = AdminReportNotification;
export type index$6_AdminSignUpNotification = AdminSignUpNotification;
export type index$6_Announcement = Announcement;
export type index$6_AnnouncementAccount = AnnouncementAccount;
export type index$6_AnnouncementStatus = AnnouncementStatus;
export type index$6_Application = Application;
export type index$6_Context = Context;
export type index$6_Conversation = Conversation;
export type index$6_CustomEmoji = CustomEmoji;
export type index$6_FamiliarFollowers = FamiliarFollowers;
export type index$6_FavouriteNotification = FavouriteNotification;
export type index$6_FeaturedTag = FeaturedTag;
export type index$6_Filter = Filter;
export type index$6_FilterContext = FilterContext;
export type index$6_FilterKeyword = FilterKeyword;
export type index$6_FilterResult = FilterResult;
export type index$6_FilterStatus = FilterStatus;
export type index$6_FollowNotification = FollowNotification;
export type index$6_FollowRequestNotification = FollowRequestNotification;
export type index$6_IdentityProof = IdentityProof;
export type index$6_InstanceStats = InstanceStats;
export type index$6_InstanceURLs = InstanceURLs;
export type index$6_List = List;
export type index$6_ListRepliesPolicy = ListRepliesPolicy;
export type index$6_Marker = Marker;
export type index$6_MarkerItem = MarkerItem;
export type index$6_MarkerTimeline = MarkerTimeline;
export type index$6_MediaAttachment = MediaAttachment;
export type index$6_MediaAttachmentMeta = MediaAttachmentMeta;
export type index$6_MediaAttachmentMetaColors = MediaAttachmentMetaColors;
export type index$6_MediaAttachmentMetaFocus = MediaAttachmentMetaFocus;
export type index$6_MediaAttachmentMetaImage = MediaAttachmentMetaImage;
export type index$6_MediaAttachmentMetaVideo = MediaAttachmentMetaVideo;
export type index$6_MediaAttachmentType = MediaAttachmentType;
export type index$6_MentionNotification = MentionNotification;
export type index$6_Notification = Notification;
export type index$6_NotificationType = NotificationType;
export type index$6_Poll = Poll;
export type index$6_PollNotification = PollNotification;
export type index$6_PollOption = PollOption;
export type index$6_Preference = Preference;
export type index$6_PreferenceReadingExpandMedia = PreferenceReadingExpandMedia;
export type index$6_PreviewCard = PreviewCard;
export type index$6_PreviewCardType = PreviewCardType;
export type index$6_Reaction = Reaction;
export type index$6_ReblogNotification = ReblogNotification;
export type index$6_Relationship = Relationship;
export type index$6_ReportCategory = ReportCategory;
export type index$6_Role = Role;
export type index$6_Rule = Rule;
export type index$6_ScheduledStatus = ScheduledStatus;
export type index$6_Status = Status;
export type index$6_StatusEdit = StatusEdit;
export type index$6_StatusMention = StatusMention;
export type index$6_StatusNotification = StatusNotification;
export type index$6_StatusParams = StatusParams;
export type index$6_StatusSource = StatusSource;
export type index$6_StatusVisibility = StatusVisibility;
export type index$6_Suggestion = Suggestion;
export type index$6_SuggestionSource = SuggestionSource;
export type index$6_Token = Token;
export type index$6_Translation = Translation;
export type index$6_TrendLink = TrendLink;
export type index$6_UpdateNotification = UpdateNotification;
export type index$6_WebPushSubscription = WebPushSubscription;
export type index$6_WebPushSubscriptionAlerts = WebPushSubscriptionAlerts;
export type index$6_WebPushSubscriptionPolicy = WebPushSubscriptionPolicy;
declare namespace index$6 {
  export {
    type Account$1 as Account,
    type Client$3 as Client,
    type index$6_AccountCredentials as AccountCredentials,
    type index$6_AccountField as AccountField,
    type index$6_AccountSource as AccountSource,
    type index$6_Activity as Activity,
    type index$6_AdminReportNotification as AdminReportNotification,
    type index$6_AdminSignUpNotification as AdminSignUpNotification,
    type index$6_Announcement as Announcement,
    type index$6_AnnouncementAccount as AnnouncementAccount,
    type index$6_AnnouncementStatus as AnnouncementStatus,
    type index$6_Application as Application,
    type index$6_Context as Context,
    type index$6_Conversation as Conversation,
    type index$6_CustomEmoji as CustomEmoji,
    type index$6_FamiliarFollowers as FamiliarFollowers,
    type index$6_FavouriteNotification as FavouriteNotification,
    type index$6_FeaturedTag as FeaturedTag,
    type index$6_Filter as Filter,
    type index$6_FilterContext as FilterContext,
    type index$6_FilterKeyword as FilterKeyword,
    type index$6_FilterResult as FilterResult,
    type index$6_FilterStatus as FilterStatus,
    type index$6_FollowNotification as FollowNotification,
    type index$6_FollowRequestNotification as FollowRequestNotification,
    type index$6_IdentityProof as IdentityProof,
    type index$6_InstanceStats as InstanceStats,
    type index$6_InstanceURLs as InstanceURLs,
    type index$6_List as List,
    type index$6_ListRepliesPolicy as ListRepliesPolicy,
    type index$6_Marker as Marker,
    type index$6_MarkerItem as MarkerItem,
    type index$6_MarkerTimeline as MarkerTimeline,
    type index$6_MediaAttachment as MediaAttachment,
    type index$6_MediaAttachmentMeta as MediaAttachmentMeta,
    type index$6_MediaAttachmentMetaColors as MediaAttachmentMetaColors,
    type index$6_MediaAttachmentMetaFocus as MediaAttachmentMetaFocus,
    type index$6_MediaAttachmentMetaImage as MediaAttachmentMetaImage,
    type index$6_MediaAttachmentMetaVideo as MediaAttachmentMetaVideo,
    type index$6_MediaAttachmentType as MediaAttachmentType,
    type index$6_MentionNotification as MentionNotification,
    type index$6_Notification as Notification,
    type index$6_NotificationType as NotificationType,
    type index$6_Poll as Poll,
    type index$6_PollNotification as PollNotification,
    type index$6_PollOption as PollOption,
    type index$6_Preference as Preference,
    type index$6_PreferenceReadingExpandMedia as PreferenceReadingExpandMedia,
    type index$6_PreviewCard as PreviewCard,
    type index$6_PreviewCardType as PreviewCardType,
    type index$6_Reaction as Reaction,
    type index$6_ReblogNotification as ReblogNotification,
    type index$6_Relationship as Relationship,
    type index$6_ReportCategory as ReportCategory,
    type index$6_Role as Role,
    type index$6_Rule as Rule,
    type index$6_ScheduledStatus as ScheduledStatus,
    type index$6_Status as Status,
    type index$6_StatusEdit as StatusEdit,
    type index$6_StatusMention as StatusMention,
    type index$6_StatusNotification as StatusNotification,
    type index$6_StatusParams as StatusParams,
    type index$6_StatusSource as StatusSource,
    type index$6_StatusVisibility as StatusVisibility,
    type index$6_Suggestion as Suggestion,
    type index$6_SuggestionSource as SuggestionSource,
    type index$6_Token as Token,
    type index$6_Translation as Translation,
    type index$6_TrendLink as TrendLink,
    type index$6_UpdateNotification as UpdateNotification,
    type index$6_WebPushSubscription as WebPushSubscription,
    type index$6_WebPushSubscriptionAlerts as WebPushSubscriptionAlerts,
    type index$6_WebPushSubscriptionPolicy as WebPushSubscriptionPolicy,
    index$7 as Admin,
    type Instance$1 as Instance,
    type InstanceAccountsConfiguration$1 as InstanceAccountsConfiguration,
    type InstanceConfiguration$1 as InstanceConfiguration,
    type InstanceMediaAttachmentsConfiguration$1 as InstanceMediaAttachmentsConfiguration,
    type InstancePollsConfiguration$1 as InstancePollsConfiguration,
    type InstanceStatusesConfiguration$1 as InstanceStatusesConfiguration,
    type Report$1 as Report,
    type Search$1 as Search,
    type Tag$1 as Tag,
    type TagHistory$1 as TagHistory,
  };
}

export interface InstanceUsageUsers {
  /** The number of active users in the past 4 weeks. */
  activeMonth: number;
}
export interface InstanceUsage {
  /** Usage data related to users on this instance. */
  users: InstanceUsageUsers;
}
export interface InstanceThumbnailVersions {
  /** The URL for the thumbnail image at 1x resolution. */
  "@1x": string;
  /** The URL for the thumbnail image at 2x resolution. */
  "@2x": string;
}
export interface InstanceThumbnail {
  /** The URL for the thumbnail image. */
  url: string;
  /** A hash computed by [the BlurHash algorithm](https://github.com/woltapp/blurhash), for generating colorful preview thumbnails when media has not been downloaded yet. */
  blurhash: string;
  /** Links to scaled resolution images, for high DPI screens. */
  versions: InstanceThumbnailVersions;
}
export interface InstanceUrls {
  /** The WebSockets URL for connecting to the streaming API. */
  streamingApi: string;
  /** Instance status URL */
  status?: string;
}
export interface InstanceAccountsConfiguration {
  /** The maximum number of featured tags allowed for each account. */
  maxFeaturedTags: number;
}
export interface InstanceStatusesConfiguration {
  /** The maximum number of allowed characters per status. */
  maxCharacters: number;
  /** The maximum number of media attachments that can be added to a status. */
  maxMediaAttachments: number;
  /** Each URL in a status will be assumed to be exactly this many characters. */
  charactersReservedPerUrl: number;
}
export interface InstanceMediaAttachmentsConfiguration {
  /** Contains MIME types that can be uploaded. */
  supportedMimeTypes: string[];
  /** The maximum size of any uploaded image, in bytes. */
  imageSizeLimit: number;
  /** The maximum number of pixels (width times height) for image uploads. */
  imageMatrixLimit: number;
  /** The maximum size of any uploaded video, in bytes. */
  videoSizeLimit: number;
  /** The maximum frame rate for any uploaded video. */
  videoFrameRateLimit: number;
  /** The maximum number of pixels (width times height) for video uploads. */
  videoMatrixLimit: number;
}
export interface InstancePollsConfiguration {
  /** Each poll is allowed to have up to this many options. */
  maxOptions: number;
  /** Each poll option is allowed to have this many characters. */
  maxCharactersPerOption: number;
  /** The shortest allowed poll duration, in seconds. */
  minExpiration: number;
  /** The longest allowed poll duration, in seconds. */
  maxExpiration: number;
}
export interface InstanceTranslationConfiguration {
  /** Whether the Translations API is available on this instance. */
  enabled: boolean;
}
export interface InstanceConfiguration {
  /** URLs of interest for clients apps. */
  urls: InstanceUrls;
  /** Limits related to accounts. */
  accounts: InstanceAccountsConfiguration;
  /** Limits related to authoring statuses. */
  statuses: InstanceStatusesConfiguration;
  /** Hints for which attachments will be accepted. */
  mediaAttachments: InstanceMediaAttachmentsConfiguration;
  /** Limits related to polls. */
  polls: InstancePollsConfiguration;
  /** Hints related to translation. */
  translation: InstanceTranslationConfiguration;
}
export interface InstanceRegistrations {
  /** Whether registrations are enabled. */
  enabled: boolean;
  /** Whether registrations require moderator approval. */
  approvalRequired: boolean;
  /** A custom message to be shown when registrations are closed. */
  message?: string | null;
}
export interface InstanceContact {
  /** An email address that can be messaged regarding inquiries or issues. */
  email: string;
  /** An account that can be contacted natively over the network regarding inquiries or issues. */
  account: Account$1;
}
/**
 * Represents the software instance of Mastodon running on this domain.
 * @see https://docs.joinmastodon.org/entities/Instance/
 */
export interface Instance {
  /** The domain name of the instance. */
  domain: string;
  /** The title of the website. */
  title: string;
  /** The version of Mastodon installed on the instance. */
  version: string;
  /** The URL for the source code of the software running on this instance, in keeping with AGPL license requirements. */
  sourceUrl: string;
  /** A short, plain-text description defined by the admin. */
  description: string;
  /** Usage data for this instance. */
  usage: InstanceUsage;
  /** An image used to represent this instance */
  thumbnail: InstanceThumbnail;
  /** Primary languages of the website and its staff. */
  languages: string[];
  /** Configured values and limits for this website. */
  configuration: InstanceConfiguration;
  /** Information about registering for this website. */
  registrations: InstanceRegistrations;
  /** Hints related to contacting a representative of the website. */
  contact: InstanceContact;
  /** An itemized list of rules for this website. */
  rules: Rule[];
}

/**
 * Represents the results of a search.
 * @see https://docs.joinmastodon.org/entities/Search/
 */
export interface Search {
  /** Accounts which match the given query */
  accounts: Account$1[];
  /** Statuses which match the given query */
  statuses: Status[];
  /** Hashtags which match the given query */
  hashtags: Tag$1;
}

export type index$5_FilterAction = FilterAction;
export type index$5_Instance = Instance;
export type index$5_InstanceAccountsConfiguration =
  InstanceAccountsConfiguration;
export type index$5_InstanceConfiguration = InstanceConfiguration;
export type index$5_InstanceContact = InstanceContact;
export type index$5_InstanceMediaAttachmentsConfiguration =
  InstanceMediaAttachmentsConfiguration;
export type index$5_InstancePollsConfiguration = InstancePollsConfiguration;
export type index$5_InstanceRegistrations = InstanceRegistrations;
export type index$5_InstanceStatusesConfiguration =
  InstanceStatusesConfiguration;
export type index$5_InstanceThumbnail = InstanceThumbnail;
export type index$5_InstanceThumbnailVersions = InstanceThumbnailVersions;
export type index$5_InstanceTranslationConfiguration =
  InstanceTranslationConfiguration;
export type index$5_InstanceUrls = InstanceUrls;
export type index$5_InstanceUsage = InstanceUsage;
export type index$5_InstanceUsageUsers = InstanceUsageUsers;
export type index$5_Search = Search;
declare namespace index$5 {
  export type {
    Filter$1 as Filter,
    FilterContext$1 as FilterContext,
    index$5_FilterAction as FilterAction,
    index$5_Instance as Instance,
    index$5_InstanceAccountsConfiguration as InstanceAccountsConfiguration,
    index$5_InstanceConfiguration as InstanceConfiguration,
    index$5_InstanceContact as InstanceContact,
    index$5_InstanceMediaAttachmentsConfiguration as InstanceMediaAttachmentsConfiguration,
    index$5_InstancePollsConfiguration as InstancePollsConfiguration,
    index$5_InstanceRegistrations as InstanceRegistrations,
    index$5_InstanceStatusesConfiguration as InstanceStatusesConfiguration,
    index$5_InstanceThumbnail as InstanceThumbnail,
    index$5_InstanceThumbnailVersions as InstanceThumbnailVersions,
    index$5_InstanceTranslationConfiguration as InstanceTranslationConfiguration,
    index$5_InstanceUrls as InstanceUrls,
    index$5_InstanceUsage as InstanceUsage,
    index$5_InstanceUsageUsers as InstanceUsageUsers,
    index$5_Search as Search,
  };
}

export type Direction = "next" | "prev";
export interface Paginator<Entity, Params = undefined>
  extends PromiseLike<Entity> {
  /**
   * Get the current direction of the paginator.
   * @returns The current direction of the paginator.
   */
  getDirection(): Direction;
  /**
   * Creates a new paginator with the given direction.
   * @param direction New direction of the paginator.
   * @returns A new paginator with the given direction.
   */
  setDirection(direction: Direction): Paginator<Entity, Params>;
  /**
   * Clones the paginator.
   * @returns A new paginator with the same direction and parameters.
   */
  clone(): Paginator<Entity, Params>;
  next(params?: Params | string): Promise<IteratorResult<Entity, undefined>>;
  return(
    value: undefined | PromiseLike<undefined>,
  ): Promise<IteratorResult<Entity, undefined>>;
  throw(e?: unknown): Promise<IteratorResult<Entity, undefined>>;
  values(): AsyncIterableIterator<Entity>;
  [Symbol.asyncIterator](): AsyncIterator<
    Entity,
    undefined,
    Params | string | undefined
  >;
}

export interface DefaultPaginationParams {
  /** Return results older than this ID. */
  readonly maxId?: string | null;
  /** Return results newer than this ID. */
  readonly sinceId?: string | null;
  /** Get a list of items with ID greater than this value excluding this ID */
  readonly minId?: string | null;
  /** Maximum number of results to return per page. Defaults to 40. NOTE: Pagination is done with the Link header from the response. */
  readonly limit?: number | null;
}

export interface CreateAccountParams {
  /** The desired username for the account */
  readonly username: string;
  /** The password to be used for login */
  readonly password: string;
  /** The email address to be used for login */
  readonly email: string;
  /** Whether the user agrees to the local rules, terms, and policies. These should be presented to the user in order to allow them to consent before setting this parameter to TRUE. */
  readonly agreement: boolean;
  /** The language of the confirmation email that will be sent */
  readonly locale: string;
  /** Text that will be reviewed by moderators if registrations require manual approval. */
  readonly reason?: string;
  /** https://github.com/mastodon/mastodon/pull/25342 */
  readonly timeZone?: string;
}
export interface UpdateCredentialsParams {
  /** Whether the account should be shown in the profile directory. */
  readonly discoverable?: boolean;
  /** Whether the account has a bot flag. */
  readonly bot?: boolean;
  /** The display name to use for the profile. */
  readonly displayName?: string | null;
  /** The account bio. */
  readonly note?: string | null;
  /** Avatar image encoded using multipart/form-data */
  readonly avatar?: Blob | string | null;
  /** Header image encoded using multipart/form-data */
  readonly header?: Blob | string | null;
  /** Whether manual approval of follow requests is required. */
  readonly locked?: boolean | null;
  readonly source?: Partial<
    Pick<AccountSource, "privacy" | "sensitive" | "language">
  > | null;
  /** Whether you want to hide followers and followings on your profile  */
  readonly hideCollections?: boolean | null;
  /**
   * Profile metadata `name` and `value`.
   * (By default, max 4 fields and 255 characters per property/value)
   */
  readonly fieldsAttributes?: AccountField[] | null;
}
export interface MuteAccountParams {
  /** Mute notifications in addition to statuses? Defaults to true. */
  readonly notifications?: boolean;
  /** Duration to mute in seconds. Defaults to 0 (indefinite). */
  readonly duration?: number;
}
export interface CreateAccountNoteParams {
  readonly comment: string;
}
export interface ListAccountStatusesParams extends DefaultPaginationParams {
  /** Only return statuses that have media attachments */
  readonly onlyMedia?: boolean | null;
  /** Only return statuses that have been pinned */
  readonly pinned?: boolean | null;
  /** Skip statuses that reply to other statuses */
  readonly excludeReplies?: boolean | null;
  /** Skip statuses that are boosts of other statuses */
  readonly excludeReblogs?: boolean | null;
  /** Only return statuses using a specific hashtag */
  readonly tagged?: string | null;
}
export interface FollowAccountParams {
  /** Receive this account's reblogs in home timeline? Defaults to true */
  readonly reblogs?: boolean | null;
  /** Receive notifications when this account posts a status? Defaults to false */
  readonly notify?: boolean | null;
  /** Array of String (ISO 639-1 language two-letter code). Filter received statuses for these languages. If not provided, you will receive this account's posts in all languages */
  readonly languages?: string[] | null;
}
export interface SearchAccountsParams {
  /** What to search for */
  readonly q: string;
  /** Maximum number of results. Defaults to 40. */
  readonly limit?: number | null;
  /** Attempt WebFinger lookup. Defaults to false. Use this when `q` is an exact address. */
  readonly resolve?: boolean | null;
  /** Only who the user is following. Defaults to false. */
  readonly following?: boolean | null;
}
export interface LookupAccountParams {
  readonly acct: string;
}
export interface FetchRelationshipsParams {
  /** Array of account IDs to check */
  readonly id: readonly string[];
}
export interface AccountRepository$1 {
  $select(id: string): {
    /**
     * View information about a profile.
     * @return Account
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    fetch(meta?: HttpMetaParams): Promise<Account$1>;
    /**
     * Follow the given account.
     * @param id The id of the account in the database
     * @param params Parameters
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    follow(
      params?: FollowAccountParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Relationship>;
    /**
     * Unfollow the given account
     * @param id The id of the account in the database
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    unfollow(
      params?: FollowAccountParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Relationship>;
    /**
     * Block the given account. Clients should filter statuses from this account if received (e.g. due to a boost in the Home timeline)
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    block(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * Unblock the given account.
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    unblock(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * Add the given account to the user's featured profiles. (Featured profiles are currently shown on the user's own public profile.)
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts#pin
     */
    pin(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * Remove the given account from the user's featured profiles.
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    unpin(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * Mute the given account. Clients should filter statuses and notifications from this account, if received (e.g. due to a boost in the Home timeline).
     * @param params Parameter
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    mute(
      params?: MuteAccountParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Relationship>;
    /**
     * Unmute the given account.
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    unmute(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * @returns N/A
     */
    removeFromFollowers(meta?: HttpMetaParams): Promise<void>;
    featuredTags: {
      /**
       * Get featured tag of the account
       * @return FeaturedTags
       */
      list(meta?: HttpMetaParams): Paginator<FeaturedTag[]>;
    };
    note: {
      /**
       * Add personal note to the account
       * @param id ID of the account
       * @param param Parameters
       * @return Relationship
       */
      create(
        params: CreateAccountNoteParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<Relationship>;
    };
    identityProofs: {
      /**
       * Identity proofs
       * @return Array of IdentityProof
       * @see https://github.com/tootsuite/mastodon/pull/10297
       */
      list(meta?: HttpMetaParams): Paginator<IdentityProof[]>;
    };
    lists: {
      /**
       * Fetch the list with the given ID. Used for verifying the title of a list.
       * @return Array of List
       * @see https://docs.joinmastodon.org/methods/timelines/lists/
       */
      list(meta?: HttpMetaParams): Paginator<List[]>;
    };
    followers: {
      /**
       * Accounts which follow the given account, if network is not hidden by the account owner.
       * @param params Parameters
       * @return Array of Account
       * @see https://docs.joinmastodon.org/methods/accounts/
       */
      list(
        params?: DefaultPaginationParams,
        meta?: HttpMetaParams,
      ): Paginator<Account$1[], DefaultPaginationParams>;
    };
    following: {
      /**
       * Accounts which the given account is following, if network is not hidden by the account owner.
       * @param params Parameters
       * @return Array of Account
       * @see https://docs.joinmastodon.org/methods/accounts/
       */
      list(
        params?: DefaultPaginationParams,
        meta?: HttpMetaParams,
      ): Paginator<Account$1[], DefaultPaginationParams>;
    };
    statuses: {
      /**
       * Statuses posted to the given account.
       * @param params Parameters
       * @return Array of Status
       * @see https://docs.joinmastodon.org/methods/accounts/
       */
      list(
        params?: ListAccountStatusesParams,
        meta?: HttpMetaParams,
      ): Paginator<Status[], ListAccountStatusesParams>;
    };
  };
  /**
   * This method allows to quickly convert a username of a known account to an ID that can be used with the REST API, or to check if a username is available for sign-up
   * @param params Parameters
   * @return Account
   */
  lookup(
    params: LookupAccountParams,
    meta?: HttpMetaParams,
  ): Promise<Account$1>;
  /**
   * Creates a user and account records. Returns an account access token
   * for the app that initiated the request. The app should save this token for later,
   * and should wait for the user to confirm their account by clicking a link in their email inbox.
   * @param params Parameters
   * @return Token
   * @see https://docs.joinmastodon.org/methods/accounts/#create
   */
  create(
    params: CreateAccountParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<Token>;
  /**
   * Test to make sure that the user token works.
   * @return the user's own Account with Source
   * @see https://docs.joinmastodon.org/methods/accounts/
   */
  verifyCredentials(meta?: HttpMetaParams): Promise<AccountCredentials>;
  /**
   *  Update the user's display and preferences.
   * @param params Parameters
   * @return the user's own Account with Source
   * @see https://docs.joinmastodon.org/methods/accounts/
   */
  updateCredentials(
    params: UpdateCredentialsParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<AccountCredentials>;
  relationships: {
    /**
     * Find out whether a given account is followed, blocked, muted, etc.
     * @return Array of Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    fetch(
      params: FetchRelationshipsParams,
      meta?: HttpMetaParams,
    ): Promise<Relationship[]>;
  };
  search: {
    /**
     * Search for matching accounts by username or display name.
     * @param params Parameters
     * @return Array of Account
     * @see https://docs.joinmastodon.org/methods/accounts/
     */
    list(
      params?: SearchAccountsParams,
      meta?: HttpMetaParams,
    ): Paginator<Account$1[], SearchAccountsParams>;
  };
  familiarFollowers: {
    /**
     * Obtain a list of all accounts that follow a given account, filtered for accounts you follow.
     * @returns Array of FamiliarFollowers
     */
    fetch(id: string[], meta?: HttpMetaParams): Promise<FamiliarFollowers[]>;
  };
}

export interface ListAccountsParams extends DefaultPaginationParams {
  /** Filter for local accounts? */
  readonly local?: boolean | null;
  /** Filter for remote accounts? */
  readonly remote?: boolean | null;
  /** Filter by the given domain */
  readonly byDomain?: string | null;
  /** Filter for currently active accounts? */
  readonly active?: boolean | null;
  /** Filter for currently pending accounts? */
  readonly pending?: boolean | null;
  /** Filter for currently disabled accounts? */
  readonly disabled?: boolean | null;
  /** Filter for currently silenced accounts? */
  readonly silenced?: boolean | null;
  /** Filter for currently suspended accounts? */
  readonly suspended?: boolean | null;
  /** Boolean. Filter for accounts force-marked as sensitive? */
  readonly sensitized?: boolean | null;
  /** Username to search for */
  readonly username?: string | null;
  /** Display name to search for */
  readonly displayName?: string | null;
  /** Lookup a user with this email */
  readonly email?: string | null;
  /** Lookup users by this IP address */
  readonly ip?: string | null;
  /** Filter for staff accounts? */
  readonly staff?: boolean | null;
}
export type AccountActionType =
  | "none"
  | "disable"
  | "silence"
  | "sensitive"
  | "suspend";
export interface CreateActionParams {
  /** Type of action to be taken. Enumerable oneOf: `none` `disable` `silence` `suspend` */
  readonly type?: AccountActionType;
  /** ID of an associated report that caused this action to be taken */
  readonly reportId?: string;
  /** ID of a preset warning */
  readonly warningPresetId?: string | null;
  /** Additional text for clarification of why this action was taken */
  readonly text?: string | null;
  /** Whether an email should be sent to the user with the above information. */
  readonly sendEmailNotification?: boolean | null;
}
export interface AccountRepository {
  /**
   * View accounts matching certain criteria for filtering, up to 100 at a time.
   * Pagination may be done with the HTTP Link header in the response.
   * @param params Parameters
   * @return Array of AdminAccount
   * @see https://docs.joinmastodon.org/methods/admin/
   */
  list(
    params?: ListAccountsParams,
    meta?: HttpMetaParams,
  ): Paginator<Account[], ListAccountsParams>;
  $select(id: string): {
    /**
     * View admin-level information about the given account.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    fetch(meta?: HttpMetaParams): Promise<Account>;
    action: {
      /**
       * Perform an action against an account and log this action in the moderation history.
       * @param params Params
       * @return Account
       * @see https://docs.joinmastodon.org/methods/admin/accounts/#action
       */
      create(
        params: CreateActionParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<void>;
    };
    /**
     * Approve the given local account if it is currently pending approval.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    approve(meta?: HttpMetaParams): Promise<Account>;
    /**
     * Reject the given local account if it is currently pending approval.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    reject(meta?: HttpMetaParams): Promise<Account>;
    /**
     * Re-enable a local account whose login is currently disabled.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    enable(meta?: HttpMetaParams): Promise<Account>;
    /**
     * Unsilence a currently silenced account.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    unsilence(meta?: HttpMetaParams): Promise<Account>;
    /**
     * Unsuspend a currently suspended account.
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    unsuspend(meta?: HttpMetaParams): Promise<Account>;
    /**
     * Unmark an account as sensitive
     * @return AdminAccount
     * @see https://docs.joinmastodon.org/methods/admin/accounts/#unsensitive
     */
    unsensitive(meta?: HttpMetaParams): Promise<Account>;
  };
}

export interface TestCanonicalEmailBlockParams {
  /** The email to canonicalize and hash */
  readonly email: string;
}
export interface CreateCanonicalEmailBlockParamsWithEmail {
  /** The email to canonicalize, hash, and block. If this parameter is provided, canonical_email_hash will be ignored. */
  readonly email: string;
}
export interface CreateCanonicalEmailBlockParamsWithCanonicalEmailHash {
  /** The hash to test against. If email is not provided, this parameter is required. */
  readonly canonicalEmailHash: string;
}
export type CreateCanonicalEmailBlockParams =
  | CreateCanonicalEmailBlockParamsWithEmail
  | CreateCanonicalEmailBlockParamsWithCanonicalEmailHash;
export interface CanonicalEmailBlockRepository {
  /**
   * List all canonical email blocks.
   * @param params Parameters
   * @return Array of CanonicalEmailBlock
   * @see https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<CanonicalEmailBlock[], DefaultPaginationParams>;
  /**
   * Canonicalize and hash an email address.
   * @param params Parameters
   * @return Array of CanonicalEmailBlock
   * @see https://docs.joinmastodon.org/methods/admin/canonical_email_blocks/#test
   */
  test(
    params: TestCanonicalEmailBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<CanonicalEmailBlock[]>;
  /**
   * Block a canonical email.
   * @param params Parameters
   * @return CanonicalEmailBlock
   * @see https://docs.joinmastodon.org/methods/admin/canonical_email_blocks
   */
  create(
    params: CreateCanonicalEmailBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<CanonicalEmailBlock>;
  $select(id: string): {
    /**
     * Show a single canonical email block
     * @return CanonicalEmailBlock
     * @see https://docs.joinmastodon.org/methods/admin/canonical_email_blocks
     */
    fetch(meta?: HttpMetaParams): Promise<CanonicalEmailBlock>;
    /**
     * Lift a block a canonical email.
     * @return null
     * @see https://docs.joinmastodon.org/methods/admin/canonical_email_blocks
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
}

export interface FetchDimensionParams {
  /**
   * Array of String. Request specific dimensions by their keystring. Supported dimensions include:
   *
   * - `languages` = Most-used languages on this server
   *
   * - `sources` = Most-used client apps on this server
   *
   * - `servers` = Remote servers with the most statuses
   *
   * - `space_usage` = How much space is used by your software stack
   *
   * - `software_versions` = The version numbers for your software stack
   *
   * - `tag_servers` = Most-common servers for statuses including a trending tag
   *
   * - `tag_languages` = Most-used languages for statuses including a trending tag
   *
   * - `instance_accounts` = Most-followed accounts from a remote server
   *
   * - `instance_languages` = Most-used languages from a remote server
   */
  readonly keys: readonly DimensionKey[];
  /** String (ISO 8601 Datetime). The start date for the time period. If a time is provided, it will be ignored. */
  readonly startAt?: string | null;
  /** String (ISO 8601 Datetime). The end date for the time period. If a time is provided, it will be ignored. */
  readonly endAt?: string | null;
  /** Integer. The maximum number of results to return for sources, servers, languages, tag or instance dimensions. */
  readonly limit?: string | null;
  readonly tagServers?: {
    /** String. When `tag_servers` is one of the requested keys, you must provide a trending tag ID to obtain information about which servers are posting the tag. */
    readonly id?: string | null;
  } | null;
  readonly tagLanguages?: {
    /** String. When `tag_languages` is one of the requested keys, you must provide a trending tag ID to obtain information about which languages are posting the tag. */
    readonly id?: string | null;
  } | null;
  readonly instanceAccounts?: {
    /** String. When `instance_accounts` is one of the requested keys, you must provide a domain to obtain information about popular accounts from that server. */
    readonly domain?: string | null;
  } | null;
  readonly instanceLanguages?: {
    /** String. When `instance_accounts` is one of the requested keys, you must provide a domain to obtain information about popular languages from that server. */
    readonly domain?: string | null;
  } | null;
}
export interface DimensionRepository {
  /**
   * Obtain information about popularity of certain accounts, servers, languages, etc.
   * @see https://docs.joinmastodon.org/methods/admin/dimensions/#get
   */
  create(
    params: FetchDimensionParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Dimension[]>;
}

export interface CreateDomainAllowParams {
  readonly domain: string;
}
export interface DomainAllowRepository {
  /**
   * Show information about all allowed domains
   * @param params Parameters
   * @return Array of DomainAllow
   * @see https://docs.joinmastodon.org/methods/admin/domain_allows/#get
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<DomainAllow[], DefaultPaginationParams>;
  /**
   * Add a domain to the list of domains allowed to federate,
   * to be used when the instance is in allow-list federation mode.
   * @param params parameters
   * @return DomainAllow
   * @see https://docs.joinmastodon.org/methods/admin/domain_allows/#get-one
   */
  create(
    params: CreateDomainAllowParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<DomainAllow>;
  $select(id: string): {
    /**
     * Show information about a single allowed domain
     * @return DomainAllow
     * @see https://docs.joinmastodon.org/methods/admin/domain_allows/#get-one
     */
    fetch(meta?: HttpMetaParams): Promise<DomainAllow>;
    /**
     * Delete a domain from the allowed domains list.
     * @return DomainAllow
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    remove(meta?: HttpMetaParams): Promise<DomainAllow>;
  };
}

export interface CreateDomainBlockParams$1 {
  /** The domain to block federation required*/
  readonly domain: string;
  /** Whether to apply a silence, suspend, or noop to the domain?*/
  readonly severity?: DomainBlockSeverity;
  /** Whether media attachments should be rejected*/
  readonly rejectMedia?: boolean;
  /** Whether reports from this domain should be rejected*/
  readonly rejectReports?: boolean;
  /**  A private note about this domain block, visible only to admins*/
  readonly privateComment?: string | null;
  /** A public note about this domain block, optionally shown on the about page*/
  readonly publicComment?: string | null;
  /** Whether to partially censor the domain when shown in public*/
  readonly obfuscate?: boolean;
}
export interface ListDomainBlocksParams {
  readonly limit?: number;
}
export type UpdateDomainBlockParams = Omit<CreateDomainBlockParams$1, "domain">;
export interface DomainBlockRepository$1 {
  /**
   * Show information about all blocked domains
   * @param params Parameters
   * @return Array of DomainBlock
   * @see https://docs.joinmastodon.org/methods/admin/domain_blocks/#get
   */
  list(
    params?: ListDomainBlocksParams,
    meta?: HttpMetaParams,
  ): Paginator<DomainBlock[], ListDomainBlocksParams>;
  /**
   * Add a domain to the list of domains blocked from federating.
   * @param params Parameters
   * @return DomainBlock
   * @see https://docs.joinmastodon.org/methods/admin/domain_blocks/#post
   */
  create(
    params: CreateDomainBlockParams$1,
    meta?: HttpMetaParams<"json">,
  ): Promise<DomainBlock>;
  $select(id: string): {
    /**
     * Show information about a single blocked domain.
     * @return DomainBlock
     * @see https://docs.joinmastodon.org/methods/admin/domain_blocks/#get-one
     */
    fetch(meta?: HttpMetaParams): Promise<DomainBlock>;
    /**
     * Change parameters for an existing domain block.
     * @param params Parameters
     * @return DomainBlock
     * @see https://docs.joinmastodon.org/methods/admin/domain_blocks/#update
     */
    update(
      params?: UpdateDomainBlockParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<DomainBlock>;
    /**
     * Lift a block against a domain.
     * @return DomainBlock
     * @see https://docs.joinmastodon.org/methods/admin/domain_blocks/#delete
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
}

export interface ListEmailDomainBlocksParams {
  /** Integer. Maximum number of results to return. Defaults to 100. */
  readonly limit?: number | null;
}
export interface CreateEmailDomainBlockParams {
  /** The domain to block federation with. */
  readonly domain: string;
}
export interface EmailDomainBlockRepository {
  /**
   * Show information about all email domains blocked from signing up.
   * @param params Parameters
   * @return Array of EmailDomainBlock
   * @see https://docs.joinmastodon.org/methods/admin/
   */
  list(
    params?: ListEmailDomainBlocksParams,
    meta?: HttpMetaParams,
  ): Paginator<EmailDomainBlock[], ListEmailDomainBlocksParams>;
  $select(id: string): {
    /**
     * Show information about a single email domain that is blocked from sign-ups.
     * @return EmailDomainBlock
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    fetch(meta?: HttpMetaParams): Promise<EmailDomainBlock>;
    /**
     * Lift a block against an email domain.
     * @return null
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
  /**
   * Add a domain to the list of email domains blocked from sign-ups.
   * @param params Parameters
   * @return EmailDomainBlock
   * @see https://docs.joinmastodon.org/methods/admin/
   */
  create(
    params: CreateEmailDomainBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<EmailDomainBlock>;
}

export interface ListIpBlocksParams {
  /** Integer. Maximum number of results to return. Defaults to 100. */
  readonly limit?: number | null;
}
export interface CreateIpBlockParams {
  /** The IP address and prefix to block. */
  readonly ip?: string | null;
  /** The policy to apply to this IP range. */
  readonly severity: IpBlockSeverity;
  /** The reason for this IP block. */
  readonly comment?: string | null;
  /** The number of seconds in which this IP block will expire. */
  readonly expiresIn?: number | null;
}
export interface UpdateIpBlockParams {
  /** The IP address and prefix to block. */
  readonly ip?: string | null;
  /** The policy to apply to this IP range. */
  readonly severity?: IpBlockSeverity | null;
  /** The reason for this IP block. */
  readonly comment?: string | null;
  /** The number of seconds in which this IP block will expire. */
  readonly expiresIn?: number | null;
}
export interface IpBlockRepository {
  /**
   * Show information about all blocked IP ranges.
   * @param params Parameters
   * @return Array of IpBlock
   * @see https://docs.joinmastodon.org/methods/admin/ip_blocks/#get
   */
  list(
    params?: ListIpBlocksParams,
    meta?: HttpMetaParams,
  ): Paginator<IpBlock[], ListIpBlocksParams>;
  $select(id: string): {
    /**
     * Show information about a single IP block.
     * @return IpBlock
     * @see https://docs.joinmastodon.org/methods/admin/ip_blocks/#get-one
     */
    fetch(meta?: HttpMetaParams): Promise<IpBlock>;
    /**
     * Change parameters for an existing IP block.
     * @param params Parameters
     * @return IpBlock
     * @see https://docs.joinmastodon.org/methods/admin/ip_blocks/#update
     */
    update(
      params: UpdateIpBlockParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<IpBlock>;
    /**
     * Lift a block against an IP range.
     * @return null
     * @see https://docs.joinmastodon.org/methods/admin/ip_blocks/#delete
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
  /**
   * Add an IP address range to the list of IP blocks.
   * @param params Parameters
   * @return IpBlock
   * @see https://docs.joinmastodon.org/methods/admin/ip_blocks/#post
   */
  create(
    params: CreateIpBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<IpBlock>;
}

export interface FetchMeasureParams {
  /**
   * Array of String. Request specific measures by their keystring. Supported measures include:
   *
   * `active_users` = Total active users on your instance within the time period
   *
   * `new_users` = Users who joined your instance within the time period
   *
   * `interactions` = Total interactions (favourites, boosts, replies) on local statuses within the time period
   *
   * `opened_reports` = Total reports filed within the time period
   *
   * `resolved_reports` = Total reports resolved within the time period
   *
   * `tag_accounts` = Total accounts who used a tag in at least one status within the time period
   *
   * `tag_uses` = Total statuses which used a tag within the time period
   *
   * `tag_servers` = Total remote origin servers for statuses which used a tag within the time period
   *
   * `instance_accounts` = Total accounts originating from a remote domain within the time period
   *
   * `instance_media_attachments` = Total space used by media attachments from a remote domain within the time period
   *
   * `instance_reports` = Total reports filed against accounts from a remote domain within the time period
   *
   * `instance_statuses` = Total statuses originating from a remote domain within the time period
   *
   * `instance_follows` = Total accounts from a remote domain followed by a local user within the time period
   *
   * `instance_followers` = Total local accounts followed by accounts from a remote domain within the time period
   */
  readonly keys: readonly MeasureKey[];
  /** String (ISO 8601 Datetime). The start date for the time period. If a time is provided, it will be ignored. */
  readonly startAt: string;
  /** String (ISO 8601 Datetime). The end date for the time period. If a time is provided, it will be ignored. */
  readonly endAt: string;
  readonly tagAccounts?: {
    /** String. When `tag_accounts` is one of the requested keys, you must provide a tag ID to obtain the measure of how many accounts used that hashtag in at least one status within the given time period. */
    readonly id?: string | null;
  } | null;
  readonly tagUses?: {
    /** String. When `tag_uses` is one of the requested keys, you must provide a tag ID to obtain the measure of how many statuses used that hashtag within the given time period. */
    readonly id?: string | null;
  } | null;
  readonly tagServers?: {
    /** String. When `tag_servers` is one of the requested keys, you must provide a tag ID to obtain the measure of how many servers used that hashtag in at least one status within the given time period. */
    readonly id?: string | null;
  } | null;
  readonly instanceAccounts?: {
    /** String. When `instance_accounts` is one of the requested keys, you must provide a remote domain to obtain the measure of how many accounts have been discovered from that server within the given time period. */
    readonly domain?: string | null;
  } | null;
  readonly instanceMediaAttachments?: {
    /** String. When `instance_media_attachments` is one of the requested keys, you must provide a remote domain to obtain the measure of how much space is used by media attachments from that server within the given time period. */
    readonly domain?: string | null;
  } | null;
  readonly instanceReports?: {
    /** String. When `instance_reports` is one of the requested keys, you must provide a remote domain to obtain the measure of how many reports have been filed against accounts from that server within the given time period. */
    readonly domain?: string | null;
  } | null;
  readonly instanceStatuses?: {
    /** String. When `instance_statuses` is one of the requested keys, you must provide a remote domain to obtain the measure of how many statuses originate from that server within the given time period. */
    readonly domain?: string | null;
  } | null;
  readonly instanceFollows?: {
    /** String. When `instance_follows` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed on accounts from that server by local accounts within the given time period */
    readonly domain?: string | null;
  } | null;
  readonly instanceFollowers?: {
    /** String. When `instance_followers` is one of the requested keys, you must provide a remote domain to obtain the measure of how many follows were performed by accounts from that server on local accounts within the given time period. */
    readonly domain?: string | null;
  } | null;
}
export interface MeasureRepository {
  /**
   * Obtain quantitative metrics about the server.
   * @see https://docs.joinmastodon.org/methods/admin/measures/#get
   */
  create(
    params: FetchMeasureParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Measure[]>;
}

export interface ListReportsParams {
  readonly resolved?: boolean | null;
  readonly accountId?: string | null;
  readonly targetAccountId?: string | null;
  readonly byTargetDomain?: string | null;
}
export interface ReportRepository$1 {
  /**
   * View all reports. Pagination may be done with HTTP Link header in the response.
   * @param params Parameters
   * @return Array of AdminReport
   * @see https://docs.joinmastodon.org/methods/admin/
   */
  list(
    params?: ListReportsParams,
    meta?: HttpMetaParams,
  ): Paginator<Report[], ListReportsParams>;
  $select(id: string): {
    /**
     * View information about the report with the given ID.
     * @return AdminReport
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    fetch(meta?: HttpMetaParams): Promise<Report>;
    /**
     * Claim the handling of this report to yourself.
     * @return AdminReport
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    assignToSelf(meta?: HttpMetaParams): Promise<Report>;
    /**
     * Unassign a report so that someone else can claim it.
     * @return AdminReport
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    unassign(meta?: HttpMetaParams): Promise<Report>;
    /**
     * Mark a report as resolved with no further action taken.
     * @return AdminReport
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    resolve(meta?: HttpMetaParams): Promise<Report>;
    /**
     * Reopen a currently closed report.
     * @return AdminReport
     * @see https://docs.joinmastodon.org/methods/admin/
     */
    reopen(meta?: HttpMetaParams): Promise<Report>;
  };
}

export interface CreateRetentionParams {
  /** String (ISO 8601 Datetime). The start date for the time period. If a time is provided, it will be ignored. */
  readonly startAt: string;
  /** String (ISO 8601 Datetime). The end date for the time period. If a time is provided, it will be ignored. */
  readonly endAt: string;
  /** String (Enumerable oneOf). Specify whether to use `day` or `month` buckets. If any other value is provided, defaults to `day`. */
  readonly frequency: CohortFrequency;
}
export interface RetentionRepository {
  /**
   * Generate a retention data report for a given time period and bucket.
   * @see https://docs.joinmastodon.org/methods/admin/retention/#create
   */
  create(
    params: CreateRetentionParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Cohort[]>;
}

export interface TrendRepository$1 {
  links: {
    /**
     * Links that have been shared more than others, including unapproved and unreviewed links.
     * @see https://docs.joinmastodon.org/methods/admin/trends/#links
     */
    list(meta?: HttpMetaParams): Paginator<TrendLink[]>;
    /** https://github.com/mastodon/mastodon/pull/24257 */
    $select(id: string): {
      approve(meta?: HttpMetaParams): Promise<TrendLink>;
      reject(meta?: HttpMetaParams): Promise<TrendLink>;
    };
    /** https://github.com/mastodon/mastodon/pull/24257 */
    publishers: {
      list(meta?: HttpMetaParams): Paginator<TrendLink[]>;
      $select(id: string): {
        approve(meta?: HttpMetaParams): Promise<TrendLink>;
        reject(meta?: HttpMetaParams): Promise<TrendLink>;
      };
    };
  };
  statuses: {
    /**
     * Statuses that have been interacted with more than others, including unapproved and unreviewed statuses.
     * @see https://docs.joinmastodon.org/methods/admin/trends/#statuses
     */
    list(meta?: HttpMetaParams): Paginator<Status[]>;
    /** https://github.com/mastodon/mastodon/pull/24257 */
    $select(id: string): {
      approve(meta?: HttpMetaParams): Promise<Status>;
      reject(meta?: HttpMetaParams): Promise<Status>;
    };
  };
  tags: {
    /**
     * Tags that are being used more frequently within the past week, including unapproved and unreviewed tags.
     * @see https://docs.joinmastodon.org/methods/admin/trends/#tags
     */
    list(meta?: HttpMetaParams): Paginator<Tag[]>;
    /** https://github.com/mastodon/mastodon/pull/24257 */
    $select(id: string): {
      approve(meta?: HttpMetaParams): Promise<Tag>;
      reject(meta?: HttpMetaParams): Promise<Tag>;
    };
  };
}

export interface AdminRepository {
  readonly accounts: AccountRepository;
  readonly canonicalEmailBlocks: CanonicalEmailBlockRepository;
  readonly dimensions: DimensionRepository;
  readonly domainAllows: DomainAllowRepository;
  readonly domainBlocks: DomainBlockRepository$1;
  readonly emailDomainBlocks: EmailDomainBlockRepository;
  readonly ipBlocks: IpBlockRepository;
  readonly measures: MeasureRepository;
  readonly reports: ReportRepository$1;
  readonly retention: RetentionRepository;
  readonly trends: TrendRepository$1;
}

export interface AnnouncementRepository {
  /**
   * Fetch announcements
   * @return Announcements
   * @see https://docs.joinmastodon.org/methods/announcements/
   */
  list(meta?: HttpMetaParams): Paginator<Announcement[]>;
  $select(id: string): {
    /**
     * Dismiss announcement
     * @return Nothing
     * @see https://docs.joinmastodon.org/methods/announcements/
     */
    dismiss(meta?: HttpMetaParams): Promise<void>;
    /**
     * Add a reaction to an announcement
     * @param name Emoji string
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/announcements/
     */
    addReaction(name: string, meta?: HttpMetaParams): Promise<void>;
    /**
     * Remove a reaction from an announcement
     * @param name Emoji string
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/announcements/
     */
    removeReaction(name: string, meta?: HttpMetaParams): Promise<void>;
  };
}

export interface CreateAppParams {
  /** A name of your application */
  readonly clientName: string;
  /**
   * Where the user should be redirected after authorization.
   * To display the authorization code to the user instead of redirecting to a web page,
   * use `urn:ietf:wg:oauth:2.0:oob` in this parameter.
   */
  readonly redirectUris: string;
  /** Space separated list of scopes. If none is provided, defaults to `read`. */
  readonly scopes: string;
  /** URL to the homepage of your app */
  readonly website?: string | null;
}
export interface AppRepository {
  /**
   * Create a new application to obtain OAuth2 credentials.
   * @param params Parameters
   * @return Returns App with `client_id` and `client_secret`
   * @see https://docs.joinmastodon.org/methods/apps/
   */
  create(
    params: CreateAppParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Client$3>;
  /**
   * Confirm that the app's OAuth2 credentials work.
   * @return Application
   * @see https://docs.joinmastodon.org/methods/apps/
   */
  verifyCredentials(meta?: HttpMetaParams): Promise<Client$3>;
}

export interface BlockRepository {
  /**
   * Blocked users
   * @param params Parameters
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/accounts/blocks/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Account$1[], DefaultPaginationParams>;
}

export interface BookmarkRepository {
  /**
   * Statuses the user has bookmarked.
   * @param params Parameters
   * @return Array of Statuses
   * @see https://docs.joinmastodon.org/methods/accounts/bookmarks/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Status[], DefaultPaginationParams>;
}

export interface ConversationRepository {
  /**
   * Show conversation
   * @param params Parameters
   * @return Array of Conversation
   * @see https://docs.joinmastodon.org/methods/timelines/conversations/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Conversation[], DefaultPaginationParams>;
  $select(id: string): {
    /**
     * Remove conversation
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/timelines/conversations/#delete
     */
    remove(meta?: HttpMetaParams): Promise<void>;
    /**
     * Mark as read
     * @return Conversation
     * @see https://docs.joinmastodon.org/methods/timelines/conversations/#post
     */
    read(meta?: HttpMetaParams): Promise<Conversation>;
    /** https://github.com/mastodon/mastodon/pull/25509 */
    unread(meta?: HttpMetaParams): Promise<Conversation>;
  };
}

export interface CustomEmojiRepository {
  /**
   * Returns custom emojis that are available on the server.
   * @return Array of CustomEmoji
   * @see https://docs.joinmastodon.org/methods/instance/custom_emojis/
   */
  list(meta?: HttpMetaParams): Paginator<CustomEmoji[]>;
}

export type DirectoryOrderType = "active" | "new";
export interface ListDirectoryParams {
  /** How many accounts to load. Default 40. */
  readonly limit?: number | null;
  /** How many accounts to skip before returning results. Default 0. */
  readonly offset?: number | null;
  /** `active` to sort by most recently posted statuses (default) or `new` to sort by most recently created profiles. */
  readonly order?: DirectoryOrderType | null;
  /** Only return local accounts. */
  readonly local?: boolean | null;
}
export interface DirectoryRepository {
  /**
   * List accounts visible in the directory.
   * @param params Parameters
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/instance/directory/
   */
  list(
    params?: ListDirectoryParams,
    meta?: HttpMetaParams<"json">,
  ): Paginator<Account$1[], ListDirectoryParams>;
}

export interface CreateDomainBlockParams {
  /** Domain to block */
  readonly domain: string;
}
export interface RemoveDomainBlockParams {
  /** Domain to unblock */
  readonly domain: string;
}
export interface DomainBlockRepository {
  /**
   * View domains the user has blocked.
   * @param params Parameters
   * @return Array of strings
   * @see https://docs.joinmastodon.org/methods/accounts/domain_blocks/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<string[], DefaultPaginationParams>;
  /**
   * Block a domain to:
   * - hide all public posts from it
   * - hide all notifications from it
   * - remove all followers from it
   * - prevent following new users from it (but does not remove existing follows)
   * @param domain Domain to block.
   * @return N/A
   * @see https://docs.joinmastodon.org/methods/accounts/domain_blocks/
   */
  create(
    params: CreateDomainBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<void>;
  /**
   * Remove a domain block, if it exists in the user's array of blocked domains.
   * @param domain Domain to unblock
   * @return N/A
   * @see https://docs.joinmastodon.org/methods/accounts/domain_blocks/
   */
  remove(
    params: RemoveDomainBlockParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<void>;
}

export interface CreateConfirmationParams {
  /** If provided, updates the unconfirmed user’s email before resending the confirmation email. */
  readonly email?: string;
}
export interface EmailRepository {
  confirmations: {
    /**
     * Resend confirmation email
     * @param params Form data parameters
     * @returns Empty object
     * @see https://docs.joinmastodon.org/methods/emails/#confirmation
     */
    create(
      params: CreateConfirmationParams,
      meta?: HttpMetaParams<"multipart-form">,
    ): Promise<void>;
  };
}

export interface EndorsementRepository {
  /**
   * Accounts that the user is currently featuring on their profile.
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/accounts/endorsements/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Account$1[], DefaultPaginationParams>;
}

export interface FavouriteRepository {
  /**
   * Statuses the user has favourited.
   * @param params Parameters
   * @return Array of Status
   * @see https://docs.joinmastodon.org/methods/accounts/favourites/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Status[], DefaultPaginationParams>;
}

export interface CreateFeaturedTagParams {
  /** The hashtag to be featured. */
  readonly name: string;
}
export interface FeaturedTagRepository {
  /**
   * View your featured tags
   * @return Array of FeaturedTag
   * @see https://docs.joinmastodon.org/methods/accounts/featured_tags/
   * @done
   */
  list(meta?: HttpMetaParams): Paginator<FeaturedTag[]>;
  /**
   * Feature a tag
   * @param params Parameters
   * @return FeaturedTag
   * @see https://docs.joinmastodon.org/methods/accounts/featured_tags/
   */
  create(
    params: CreateFeaturedTagParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<FeaturedTag>;
  suggestions: {
    /**
     * Shows your 10 most-used tags, with usage history for the past week.
     * @return Array of Tag with History
     * @see https://docs.joinmastodon.org/methods/accounts/featured_tags/
     */
    list(meta?: HttpMetaParams): Paginator<Tag$1[]>;
  };
  $select(id: string): {
    /**
     * Un-feature a tag
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/accounts/featured_tags/
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
}

export interface CreateFilterParams$1 {
  /** Text to be filtered */
  readonly phrase: string;
  /**
   * Array of enumerable strings `home`, `notifications`, `public`, `thread`.
   * At least one context must be specified.
   */
  readonly context: readonly FilterContext[] | null;
  /** Should the server irreversibly drop matching entities from home and notifications? */
  readonly irreversible?: boolean | null;
  /** Consider word boundaries? */
  readonly wholeWord?: boolean | null;
  /** ISO 8601 Date-time for when the filter expires. Otherwise, null for a filter that doesn't expire. */
  readonly expiresIn?: number | null;
}
export type UpdateFilterParams$1 = CreateFilterParams$1;
export interface FilterRepository$1 {
  /**
   * View all filters
   * @return Filter
   * @see https://docs.joinmastodon.org/methods/accounts/filters/
   */
  list(meta?: HttpMetaParams): Paginator<Filter[]>;
  $select(id: string): {
    /**
     * View a single filter
     * @return Returns Filter
     * @see https://docs.joinmastodon.org/methods/accounts/filters/
     */
    fetch(meta?: HttpMetaParams): Promise<Filter>;
    /**
     * Update a filter
     * @param params Parameters
     * @return Filter
     * @see https://docs.joinmastodon.org/methods/accounts/filters/
     */
    update(
      params?: UpdateFilterParams$1,
      meta?: HttpMetaParams<"json">,
    ): Promise<Filter>;
    /**
     * Remove a filter
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/accounts/filters/
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
  /**
   * Create a filter
   * @param params Parameters
   * @return Filter
   * @see https://docs.joinmastodon.org/methods/accounts/filters/
   */
  create(
    params?: CreateFilterParams$1,
    meta?: HttpMetaParams<"json">,
  ): Promise<Filter>;
}

export interface FollowRequestRepository {
  /**
   * Pending Follows
   * @param params Parameters
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Account$1[], DefaultPaginationParams>;
  $select(id: string): {
    /**
     * Accept Follow
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/#post-authorize
     */
    authorize(meta?: HttpMetaParams): Promise<Relationship>;
    /**
     * Reject Follow
     * @return Relationship
     * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/#post-reject
     */
    reject(meta?: HttpMetaParams): Promise<Relationship>;
  };
}

export interface FollowedTagRepository {
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<Tag$1[], DefaultPaginationParams>;
}

export interface InstanceRepository$1 {
  /**
   * Information about the server.
   * @return Instance
   * @see https://docs.joinmastodon.org/methods/instance/
   */
  fetch(meta?: HttpMetaParams): Promise<Instance$1>;
  peers: {
    /**
     * Domains that this instance is aware of.
     * @return Array of Activity
     * @see https://docs.joinmastodon.org/methods/instance/
     */
    list(meta?: HttpMetaParams): Paginator<string[]>;
  };
  activity: {
    /**
     * Instance activity over the last 3 months, binned weekly.
     * @return Array of Activity
     * @see https://docs.joinmastodon.org/methods/instance/#activity
     */
    list(meta?: HttpMetaParams): Paginator<Activity[]>;
  };
  languages: {
    /** https://github.com/mastodon/mastodon/pull/24443 */
    list(meta?: HttpMetaParams): Promise<string[]>;
  };
  translationLanguages: {
    /** https://github.com/mastodon/mastodon/pull/24037 */
    list(meta?: HttpMetaParams): Promise<Record<string, string[]>>;
  };
}

export interface CreateListParams {
  /** The title of the list to be created. */
  readonly title: string;
  /** https://github.com/mastodon/mastodon/pull/22048/files */
  readonly exclusive?: boolean;
}
export type UpdateListParams = CreateListParams;
export interface AddListAccountsParams {
  /** Array of account IDs */
  readonly accountIds: readonly string[];
}
export type RemoveListAccountsParams = AddListAccountsParams;
export interface ListRepository {
  $select(id: string): {
    /**
     * Fetch the list with the given ID. Used for verifying the title of a list.
     * @return List
     * @see https://docs.joinmastodon.org/methods/timelines/lists/
     */
    fetch(meta?: HttpMetaParams): Promise<List>;
    /**
     * Change the title of a list.
     * @param params Parameters
     * @return List
     * @see https://docs.joinmastodon.org/methods/timelines/lists/
     */
    update(
      params: UpdateListParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<List>;
    /**
     * Delete a list
     * @param id ID of the list in the database
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/timelines/lists/
     */
    remove(meta?: HttpMetaParams): Promise<void>;
    accounts: {
      /**
       * View accounts in list
       * @param id ID of the list in the database
       * @param params Parameters
       * @return Array of Account
       * @see https://docs.joinmastodon.org/methods/timelines/lists#accounts
       */
      list(
        params?: DefaultPaginationParams,
        meta?: HttpMetaParams,
      ): Paginator<Account$1[], DefaultPaginationParams>;
      /**
       * Add accounts to the given list. Note that the user must be following these accounts.
       * @param id ID of the list in the database
       * @param params Parameters
       * @return N/A
       * @see https://docs.joinmastodon.org/methods/timelines/lists#accounts-add
       */
      create(
        params: AddListAccountsParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<void>;
      /**
       * Remove accounts from the given list.
       * @param id ID of the list in the database
       * @param params Parameters
       * @return N/A
       * @see https://docs.joinmastodon.org/methods/timelines/lists#accounts-remove
       */
      remove(
        params: RemoveListAccountsParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<void>;
    };
  };
  /**
   * Fetch all lists that the user owns.
   * @return Array of List
   * @see https://docs.joinmastodon.org/methods/timelines/lists/
   */
  list(meta?: HttpMetaParams): Paginator<List[]>;
  /**
   * Create a new list.
   * @param params Parameters
   * @return List
   * @see https://docs.joinmastodon.org/methods/timelines/lists/
   */
  create(
    params: CreateListParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<List>;
}

export interface FetchMarkersParams {
  /**
   * Array of markers to fetch.
   * String enum anyOf `home`, `notifications`.
   * If not provided, an empty object will be returned.
   */
  readonly timeline?: readonly MarkerTimeline[];
}
export type CreateMarkersParams = {
  readonly /** ID of the last status read in the timeline. */
  [key in MarkerTimeline]?: Pick<MarkerItem, "lastReadId">;
};
export interface MarkerRepository {
  /**
   * Get saved timeline position
   * @param params Parameters
   * @return Markers
   * @see https://docs.joinmastodon.org/methods/timelines/markers/
   */
  fetch(params?: FetchMarkersParams, meta?: HttpMetaParams): Promise<Marker>;
  /**
   * Save position in timeline
   * @param params Parameters
   * @return Markers
   * @see https://github.com/tootsuite/mastodon/pull/11762
   */
  create(
    params: CreateMarkersParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Marker>;
}

export interface CreateMediaAttachmentParams$1 {
  /** The file to be attached, using multipart form data. */
  readonly file: Blob | string;
  /** A plain-text description of the media, for accessibility purposes. */
  readonly description?: string | null;
  /** Two floating points (x,y), comma-delimited, ranging from -1.0 to 1.0 */
  readonly focus?: string | null;
  /** Custom thumbnail */
  readonly thumbnail?: Blob | string | null;
}
export type UpdateMediaAttachmentParams =
  Partial<CreateMediaAttachmentParams$1>;
export interface MediaAttachmentRepository$1 {
  /**
   * Creates an attachment to be used with a new status.
   * @param params Parameters
   * @return Attachment
   * @see https://docs.joinmastodon.org/methods/statuses/media/
   */
  create(
    params: CreateMediaAttachmentParams$1,
    meta?: HttpMetaParams<"json">,
  ): Promise<MediaAttachment>;
  $select(id: string): {
    /**
     * Fetches an attachment to be used with a new status.
     * @param id ID of the attachment
     * @see https://github.com/tootsuite/mastodon/pull/13210
     */
    fetch(meta?: HttpMetaParams): Promise<MediaAttachment>;
    /**
     * Update an Attachment, before it is attached to a status and posted.
     * @param id The id of the Attachment entity to be updated
     * @param params Parameters
     * @return Attachment
     * @see https://docs.joinmastodon.org/methods/statuses/media/
     */
    update(
      params: UpdateMediaAttachmentParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<MediaAttachment>;
  };
}

export interface MuteRepository {
  /**
   * Accounts the user has muted.
   * @param params Parameters
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/accounts/mutes/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams<"json">,
  ): Paginator<Account$1[], DefaultPaginationParams>;
}

export interface ListNotificationsParams extends DefaultPaginationParams {
  /** Instead of specifying every known type to exclude, you can specify only the types you want. */
  readonly types?: readonly NotificationType[] | null;
  /** ID of the account */
  readonly accountId?: string | null;
  /** Array of notifications to exclude (Allowed values: "follow", "favourite", "reblog", "mention") */
  readonly excludeTypes?: readonly NotificationType[] | null;
}
export interface NotificationRepository {
  /**
   * Notifications concerning the user.
   * This API returns Link headers containing links to the next/previous page.
   * However, the links can also be constructed dynamically using query params and `id` values.
   * @param params Query parameter
   * @return Array of Notification
   * @see https://docs.joinmastodon.org/methods/notifications/
   */
  list(
    params?: ListNotificationsParams,
    meta?: HttpMetaParams<"json">,
  ): Paginator<Notification[], ListNotificationsParams>;
  $select(id: string): {
    /**
     * View information about a notification with a given ID.
     * @return Notification
     * @see https://docs.joinmastodon.org/methods/notifications/
     */
    fetch(meta?: HttpMetaParams): Promise<Notification>;
    /**
     * Clear a single notification from the server.
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/notifications/
     */
    dismiss(meta?: HttpMetaParams): Promise<void>;
  };
  /**
   * Clear all notifications from the server.
   * @return N/A
   * @see https://docs.joinmastodon.org/methods/notifications/
   */
  clear(meta?: HttpMetaParams): Promise<void>;
}

export interface VotePollParams {
  /** Array of own votes containing index for each option (starting from 0) */
  readonly choices: readonly number[];
}
export interface PollRepository {
  $select(id: string): {
    /**
     * View a poll
     * @return Poll
     * @see https://docs.joinmastodon.org/methods/statuses/polls#get
     */
    fetch(meta?: HttpMetaParams): Promise<Poll>;
    votes: {
      /**
       * Vote on a poll
       * @param params Parameters
       * @return Poll
       * @see https://docs.joinmastodon.org/methods/statuses/polls#vote
       */
      create(
        params: VotePollParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<Poll>;
    };
  };
}

export interface PreferenceRepository {
  /**
   * Preferences defined by the user in their account settings.
   * @return Preferences by key and value
   * @see https://docs.joinmastodon.org/methods/accounts/preferences/
   */
  fetch(meta?: HttpMetaParams): Promise<Preference>;
}

export interface CreateWebPushSubscriptionParams {
  readonly subscription: {
    /** Endpoint URL that is called when a notification event occurs. */
    readonly endpoint: string;
    readonly keys: {
      /** User agent public key. Base64 encoded string of public key of ECDH key using `prime256v1` curve. */
      readonly p256dh: string;
      /** Auth secret. Base64 encoded string of 16 bytes of random data. */
      readonly auth: string;
    };
  };
  readonly data?: {
    readonly alerts?: Partial<WebPushSubscriptionAlerts> | null;
  } | null;
  readonly policy: WebPushSubscriptionPolicy;
}
export type UpdateWebPushSubscriptionParams = Pick<
  CreateWebPushSubscriptionParams,
  "data"
>;
export interface WebPushSubscriptionRepository {
  /**
   * Add a Web Push API subscription to receive notifications.
   * Each access token can have one push subscription.
   * If you create a new subscription, the old subscription is deleted.
   * @param params Parameters
   * @return Returns Push Subscription
   * @see https://docs.joinmastodon.org/methods/push
   */
  create(
    params: CreateWebPushSubscriptionParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<WebPushSubscription>;
  /**
   * View the PushSubscription currently associated with this access token.
   * @return PushSubscription
   * @see https://docs.joinmastodon.org/methods/push/#get
   */
  fetch(meta?: HttpMetaParams): Promise<WebPushSubscription>;
  /**
   * Updates the current push subscription. Only the data part can be updated. To change fundamentals, a new subscription must be created instead.
   * @param params Parameters
   * @return PushSubscription
   * @see https://docs.joinmastodon.org/methods/push/#update
   */
  update(
    params: UpdateWebPushSubscriptionParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<WebPushSubscription>;
  /**
   * Removes the current Web Push API subscription.
   * @return N/A
   * @see https://docs.joinmastodon.org/methods/push/#delete
   */
  remove(meta?: HttpMetaParams): Promise<void>;
}

export interface PushRepository {
  readonly subscription: WebPushSubscriptionRepository;
}

export interface ReportAccountParams {
  /** ID of the account to report */
  readonly accountId: string;
  /** Array of Statuses to attach to the report, for context */
  readonly statusIds?: readonly string[] | null;
  /** Reason for the report (default max 1000 characters) */
  readonly comment?: string | null;
  /** If the account is remote, should the report be forwarded to the remote admin? */
  readonly forward?: boolean | null;
  /** category can be one of: spam, violation, other (default) */
  readonly category?: ReportCategory | null;
  /** must reference rules returned in GET /api/v1/instance */
  readonly ruleIds?: readonly string[] | null;
  /** https://github.com/mastodon/mastodon/pull/25866 */
  readonly forwardToDomains?: readonly string[] | null;
}
export interface ReportRepository {
  /**
   * File a report
   * @param params Parameters
   * @return Report
   * @see https://docs.joinmastodon.org/methods/accounts/reports/
   */
  create(
    params: ReportAccountParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Report$1>;
}

export interface UpdateScheduledStatusParams {
  /** ISO 8601 Date-time at which the status will be published. Must be at least 5 minutes into the future. */
  readonly scheduledAt: string;
}
export interface ScheduledStatusRepository {
  /**
   * View scheduled statuses
   * @param params Parameters
   * @return Array of ScheduledStatus
   * @see https://docs.joinmastodon.org/methods/statuses/scheduled_statuses/
   */
  list(
    params?: DefaultPaginationParams,
    meta?: HttpMetaParams,
  ): Paginator<ScheduledStatus[], DefaultPaginationParams>;
  $select(id: string): {
    /**
     * View a single scheduled status
     * @return ScheduledStatus
     * @see https://docs.joinmastodon.org/methods/statuses/scheduled_statuses/
     */
    fetch(meta?: HttpMetaParams): Promise<ScheduledStatus>;
    /**
     * Update Scheduled status
     * @param params Parameters
     * @return ScheduledStatus
     * @see https://docs.joinmastodon.org/api/rest/scheduled-statuses/#put-api-v1-scheduled-statuses-id
     */
    update(
      params: UpdateScheduledStatusParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<ScheduledStatus>;
    /**
     * Cancel a scheduled status
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/statuses/scheduled_statuses/
     */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
}

export type SearchType$1 = "accounts" | "hashtags" | "statuses";
export interface SearchParams$1 extends DefaultPaginationParams {
  /** Attempt WebFinger lookup. Defaults to false. */
  readonly q: string;
  /** Enum(accounts, hashtags, statuses) */
  readonly type?: SearchType$1 | null;
  /** Attempt WebFinger look-up */
  readonly resolve?: boolean | null;
  /** If provided, statuses returned will be authored only by this account */
  readonly accountId?: string | null;
}
export interface SearchRepository$1 {
  /**
   * Search, but hashtags is an array of strings instead of an array of Tag.
   * @param params Parameters
   * @return Results
   * @see https://docs.joinmastodon.org/methods/search/
   */
  fetch(
    params: SearchParams$1,
    meta?: HttpMetaParams,
  ): Paginator<Search$1, SearchParams$1>;
}

export interface CreateStatusParamsBase {
  /** ID of the status being replied to, if status is a reply */
  readonly inReplyToId?: string | null;
  /** Mark status and attached media as sensitive? */
  readonly sensitive?: boolean | null;
  /** Text to be shown as a warning or subject before the actual content. Statuses are generally collapsed behind this field. */
  readonly spoilerText?: string | null;
  /** Visibility of the posted status. Enumerable oneOf public, unlisted, private, direct. */
  readonly visibility?: StatusVisibility | null;
  /** ISO 639 language code for this status. */
  readonly language?: string | null;
  /** https://github.com/mastodon/mastodon/pull/18350 */
  readonly allowedMentions?: readonly string[] | null;
}
export interface CreateStatusPollParam {
  /** Array of possible answers. If provided, `media_ids` cannot be used, and `poll[expires_in]` must be provided. */
  readonly options: readonly string[];
  /** Duration the poll should be open, in seconds. If provided, media_ids cannot be used, and poll[options] must be provided. */
  readonly expiresIn: number;
  /** Allow multiple choices? */
  readonly multiple?: boolean | null;
  /** Hide vote counts until the poll ends? */
  readonly hideTotals?: boolean | null;
}
export interface CreateStatusParamsWithStatus extends CreateStatusParamsBase {
  /** Text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  readonly status: string;
  /** Array of Attachment ids to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  readonly mediaIds?: never;
  readonly poll?: CreateStatusPollParam | null;
}
export interface CreateStatusParamsWithMediaIds extends CreateStatusParamsBase {
  /** Array of Attachment ids to be attached as media. If provided, `status` becomes optional, and `poll` cannot be used. */
  readonly mediaIds: readonly string[];
  /** Text content of the status. If `media_ids` is provided, this becomes optional. Attaching a `poll` is optional while `status` is provided. */
  readonly status?: string | null;
  readonly poll?: never;
}
export type CreateStatusParams =
  | CreateStatusParamsWithStatus
  | CreateStatusParamsWithMediaIds;
export type CreateScheduledStatusParams = CreateStatusParams & {
  /** ISO 8601 Date-time at which to schedule a status. Providing this parameter will cause ScheduledStatus to be returned instead of Status. Must be at least 5 minutes in the future. */
  readonly scheduledAt?: string | null;
};
export interface UpdateStatusMediaAttribute {
  /** The ID of the media attachment to be modified */
  readonly id: string;
  /** A plain-text description of the media, for accessibility purposes. */
  readonly description?: string | null;
  /** Two floating points (x,y), comma-delimited, ranging from -1.0 to 1.0 */
  readonly focus?: string | null;
  /** Custom thumbnail */
  readonly thumbnail?: Blob | string | null;
}
export type UpdateStatusParams = CreateStatusParams & {
  /** https://github.com/mastodon/mastodon/pull/20878 */
  readonly mediaAttributes?: readonly UpdateStatusMediaAttribute[];
};
export interface ReblogStatusParams {
  /** any visibility except limited or direct (i.e. public, unlisted, private). Defaults to public. Currently unused in UI. */
  readonly visibility: StatusVisibility;
}
export interface TranslateStatusParams {
  /** String (ISO 639 language code). The status content will be translated into this language. Defaults to the user’s current locale. */
  readonly lang?: string;
}
export interface StatusRepository {
  /**
   * Post a new status.
   * @param params Parameters
   * @return Status. When scheduled_at is present, ScheduledStatus is returned instead.
   * @see https://docs.joinmastodon.org/api/rest/statuses/#post-api-v1-statuses
   */
  create(
    params: CreateStatusParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Status>;
  create(
    params: CreateScheduledStatusParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<ScheduledStatus>;
  $select(id: string): {
    /**
     * View information about a status.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    fetch(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Update a status
     * @param params Parameters
     * @return Status. When scheduled_at is present, ScheduledStatus is returned instead.
     * @see https://docs.joinmastodon.org/api/rest/statuses/#post-api-v1-statuses
     */
    update(
      params: UpdateStatusParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Status>;
    /**
     * Delete one of your own statuses.
     * @return Status with source text and `media_attachments` or `poll`
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    remove(meta?: HttpMetaParams): Promise<Status>;
    context: {
      /**
       * View statuses above and below this status in the thread.
       * @return Context
       * @see https://docs.joinmastodon.org/methods/statuses/
       */
      fetch(meta?: HttpMetaParams): Promise<Context>;
    };
    card: {
      /**
       * Preview card
       * @return Card
       * @see https://docs.joinmastodon.org/api/rest/statuses/#get-api-v1-statuses-id-card
       * @deprecated
       */
      fetch(meta?: HttpMetaParams): Promise<PreviewCard>;
    };
    /**
     * Add a status to your favourites list.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    favourite(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Remove a status from your favourites list.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    unfavourite(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Do not receive notifications for the thread that this status is part of. Must be a thread in which you are a participant.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    mute(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Start receiving notifications again for the thread that this status is part of.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    unmute(meta?: HttpMetaParams): Promise<Status>;
    rebloggedBy: {
      /**
       * View who boosted a given status.
       * @return Array of Account
       * @see https://docs.joinmastodon.org/methods/statuses/
       */
      list(meta?: HttpMetaParams): Paginator<Account$1[]>;
    };
    favouritedBy: {
      /**
       * View who favourited a given status.
       * @return Array of Account
       * @see https://docs.joinmastodon.org/methods/statuses/
       */
      list(meta?: HttpMetaParams): Paginator<Account$1[]>;
    };
    /**
     * Re-share a status.
     * @return Status
     * @see https://docs.joinmastodon.org/api/rest/statuses/#post-api-v1-statuses-id-reblog
     */
    reblog(
      params?: ReblogStatusParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Status>;
    /**
     * Undo a re-share of a status.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    unreblog(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Feature one of your own public statuses at the top of your profile.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    pin(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Un-feature a status from the top of your profile.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    unpin(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Privately bookmark a status.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    bookmark(meta?: HttpMetaParams): Promise<Status>;
    /**
     * Remove a status from your private bookmarks.
     * @return Status
     * @see https://docs.joinmastodon.org/methods/statuses/
     */
    unbookmark(meta?: HttpMetaParams): Promise<Status>;
    history: {
      /**
       * Get all known versions of a status, including the initial and current states.
       * @returns StatusEdit
       * @see https://docs.joinmastodon.org/methods/statuses/#history
       */
      list(meta?: HttpMetaParams): Paginator<StatusEdit[]>;
    };
    source: {
      /**
       * Obtain the source properties for a status so that it can be edited.
       * @returns StatusSource
       * @see https://docs.joinmastodon.org/methods/statuses/#source
       */
      fetch(meta?: HttpMetaParams): Promise<StatusSource>;
    };
    /**
     * Translate the status content into some language.
     * @param params Form data parameters
     * @returns Translation
     */
    translate(
      params: TranslateStatusParams,
      meta?: HttpMetaParams,
    ): Promise<Translation>;
  };
}

export interface ListSuggestionParams {
  /** Integer. Maximum number of results to return. Defaults to 40. */
  readonly limit?: number | null;
}
export interface SuggestionRepository$1 {
  /**
   * Accounts the user has had past positive interactions with, but is not yet following.
   * @param params Parameters
   * @return Array of Accounts
   * @see https://docs.joinmastodon.org/methods/suggestions/#v1
   */
  list(
    params?: ListSuggestionParams,
    meta?: HttpMetaParams,
  ): Paginator<Account$1[], ListSuggestionParams>;
  $select(id: string): {
    /**
     * Remove an account from follow suggestions.
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/accounts/suggestions/
     */
    remove(id: string, meta?: HttpMetaParams): Promise<void>;
  };
}

export interface TagRepository {
  $select(id: string): {
    /**
     * Show a hashtag and its associated information
     * @return Tag
     */
    fetch(meta?: HttpMetaParams): Promise<Tag$1>;
    /**
     * Follow a hashtag. Posts containing a followed hashtag will be inserted into your home timeline.
     * @return Tag
     */
    follow(meta?: HttpMetaParams): Promise<Tag$1>;
    /**
     * Unfollow a hashtag. Posts containing a followed hashtag will no longer be inserted into your home timeline.
     * @return Tag
     */
    unfollow(meta?: HttpMetaParams): Promise<Tag$1>;
  };
}

export interface ListTimelineParams extends DefaultPaginationParams {
  /** Show only local statuses? Defaults to false. */
  readonly local?: boolean | null;
  /** Show only statuses with media attached? Defaults to false. */
  readonly onlyMedia?: boolean | null;
  /** Remote only */
  readonly remote?: boolean | null;
}
export interface TimelineRepository {
  home: {
    /**
     * View statuses from followed users.
     * @param params Parameters
     * @return Array of Status
     * @see https://docs.joinmastodon.org/methods/timelines/
     */
    list(
      params?: ListTimelineParams,
      meta?: HttpMetaParams,
    ): Paginator<Status[], ListTimelineParams>;
  };
  public: {
    /**
     * Public timeline
     * @param params Parameters
     * @return Array of Status
     * @see https://docs.joinmastodon.org/methods/timelines/
     */
    list(
      params?: ListTimelineParams,
      meta?: HttpMetaParams,
    ): Paginator<Status[], ListTimelineParams>;
  };
  tag: {
    $select(hashtag: string): {
      /**
       * View public statuses containing the given hashtag.
       * @param hashtag Content of a #hashtag, not including # symbol.
       * @param params Parameters
       * @return Array of Status
       * @see https://docs.joinmastodon.org/methods/timelines#tag
       */
      list(
        params?: ListTimelineParams,
        meta?: HttpMetaParams,
      ): Paginator<Status[], ListTimelineParams>;
    };
  };
  list: {
    $select(id: string): {
      /**
       * View statuses in the given list timeline.
       * @param id Local ID of the list in the database.
       * @param params Query parameter
       * @return Array of Status
       * @see https://docs.joinmastodon.org/methods/timelines/
       */
      list(
        params?: ListTimelineParams,
        meta?: HttpMetaParams,
      ): Paginator<Status[], ListTimelineParams>;
    };
  };
  direct: {
    /**
     * View statuses with a “direct” privacy, from your account or in your notifications.
     * @returns Array of Status
     * @see https://docs.joinmastodon.org/methods/timelines/
     */
    list(
      params?: ListTimelineParams,
      meta?: HttpMetaParams,
    ): Paginator<Status[], ListTimelineParams>;
  };
}

export interface ListTrendsParams {
  /** Maximum number of results to return. Defaults to 10. */
  readonly limit: number;
}
export interface TrendRepository {
  statuses: {
    /**
     * View trending statuses
     * @returns Array of Status
     * @see https://docs.joinmastodon.org/methods/trends/#statuses
     */
    list(
      params?: DefaultPaginationParams,
      meta?: HttpMetaParams,
    ): Paginator<Status[], DefaultPaginationParams>;
  };
  links: {
    /**
     * Links that have been shared more than others.
     * @see https://docs.joinmastodon.org/methods/trends/#links
     */
    list(
      params?: DefaultPaginationParams,
      meta?: HttpMetaParams,
    ): Paginator<TrendLink[], DefaultPaginationParams>;
  };
  tags: {
    /**
     * Tags that are being used more frequently within the past week.
     * @param params Parameters
     * @return Array of Tag with History
     * @see https://docs.joinmastodon.org/methods/trends/#tags
     */
    list(
      params?: ListTrendsParams,
      meta?: HttpMetaParams,
    ): Paginator<Tag$1[], ListTrendsParams>;
  };
}

export interface ProfileRepository {
  avatar: {
    /**https://github.com/mastodon/mastodon/pull/25124 */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
  header: {
    /**https://github.com/mastodon/mastodon/pull/25124 */
    remove(meta?: HttpMetaParams): Promise<void>;
  };
}

export type index$4_AddListAccountsParams = AddListAccountsParams;
export type index$4_AdminRepository = AdminRepository;
export type index$4_AnnouncementRepository = AnnouncementRepository;
export type index$4_AppRepository = AppRepository;
export type index$4_BlockRepository = BlockRepository;
export type index$4_BookmarkRepository = BookmarkRepository;
export type index$4_ConversationRepository = ConversationRepository;
export type index$4_CreateAccountNoteParams = CreateAccountNoteParams;
export type index$4_CreateAccountParams = CreateAccountParams;
export type index$4_CreateAppParams = CreateAppParams;
export type index$4_CreateConfirmationParams = CreateConfirmationParams;
export type index$4_CreateDomainBlockParams = CreateDomainBlockParams;
export type index$4_CreateFeaturedTagParams = CreateFeaturedTagParams;
export type index$4_CreateListParams = CreateListParams;
export type index$4_CreateMarkersParams = CreateMarkersParams;
export type index$4_CreateScheduledStatusParams = CreateScheduledStatusParams;
export type index$4_CreateStatusParams = CreateStatusParams;
export type index$4_CreateStatusParamsBase = CreateStatusParamsBase;
export type index$4_CreateStatusParamsWithMediaIds =
  CreateStatusParamsWithMediaIds;
export type index$4_CreateStatusParamsWithStatus = CreateStatusParamsWithStatus;
export type index$4_CreateStatusPollParam = CreateStatusPollParam;
export type index$4_CustomEmojiRepository = CustomEmojiRepository;
export type index$4_DirectoryOrderType = DirectoryOrderType;
export type index$4_DirectoryRepository = DirectoryRepository;
export type index$4_DomainBlockRepository = DomainBlockRepository;
export type index$4_EmailRepository = EmailRepository;
export type index$4_EndorsementRepository = EndorsementRepository;
export type index$4_FavouriteRepository = FavouriteRepository;
export type index$4_FeaturedTagRepository = FeaturedTagRepository;
export type index$4_FetchMarkersParams = FetchMarkersParams;
export type index$4_FetchRelationshipsParams = FetchRelationshipsParams;
export type index$4_FollowAccountParams = FollowAccountParams;
export type index$4_FollowRequestRepository = FollowRequestRepository;
export type index$4_FollowedTagRepository = FollowedTagRepository;
export type index$4_ListAccountStatusesParams = ListAccountStatusesParams;
export type index$4_ListDirectoryParams = ListDirectoryParams;
export type index$4_ListNotificationsParams = ListNotificationsParams;
export type index$4_ListRepository = ListRepository;
export type index$4_ListSuggestionParams = ListSuggestionParams;
export type index$4_ListTimelineParams = ListTimelineParams;
export type index$4_ListTrendsParams = ListTrendsParams;
export type index$4_LookupAccountParams = LookupAccountParams;
export type index$4_MarkerRepository = MarkerRepository;
export type index$4_MuteAccountParams = MuteAccountParams;
export type index$4_MuteRepository = MuteRepository;
export type index$4_NotificationRepository = NotificationRepository;
export type index$4_PollRepository = PollRepository;
export type index$4_PreferenceRepository = PreferenceRepository;
export type index$4_ProfileRepository = ProfileRepository;
export type index$4_PushRepository = PushRepository;
export type index$4_ReblogStatusParams = ReblogStatusParams;
export type index$4_RemoveDomainBlockParams = RemoveDomainBlockParams;
export type index$4_RemoveListAccountsParams = RemoveListAccountsParams;
export type index$4_ReportAccountParams = ReportAccountParams;
export type index$4_ReportRepository = ReportRepository;
export type index$4_ScheduledStatusRepository = ScheduledStatusRepository;
export type index$4_SearchAccountsParams = SearchAccountsParams;
export type index$4_StatusRepository = StatusRepository;
export type index$4_TagRepository = TagRepository;
export type index$4_TimelineRepository = TimelineRepository;
export type index$4_TranslateStatusParams = TranslateStatusParams;
export type index$4_TrendRepository = TrendRepository;
export type index$4_UpdateCredentialsParams = UpdateCredentialsParams;
export type index$4_UpdateListParams = UpdateListParams;
export type index$4_UpdateMediaAttachmentParams = UpdateMediaAttachmentParams;
export type index$4_UpdateScheduledStatusParams = UpdateScheduledStatusParams;
export type index$4_UpdateStatusParams = UpdateStatusParams;
export type index$4_VotePollParams = VotePollParams;
declare namespace index$4 {
  export type {
    AccountRepository$1 as AccountRepository,
    CreateFilterParams$1 as CreateFilterParams,
    CreateMediaAttachmentParams$1 as CreateMediaAttachmentParams,
    FilterRepository$1 as FilterRepository,
    index$4_AddListAccountsParams as AddListAccountsParams,
    index$4_AdminRepository as AdminRepository,
    index$4_AnnouncementRepository as AnnouncementRepository,
    index$4_AppRepository as AppRepository,
    index$4_BlockRepository as BlockRepository,
    index$4_BookmarkRepository as BookmarkRepository,
    index$4_ConversationRepository as ConversationRepository,
    index$4_CreateAccountNoteParams as CreateAccountNoteParams,
    index$4_CreateAccountParams as CreateAccountParams,
    index$4_CreateAppParams as CreateAppParams,
    index$4_CreateConfirmationParams as CreateConfirmationParams,
    index$4_CreateDomainBlockParams as CreateDomainBlockParams,
    index$4_CreateFeaturedTagParams as CreateFeaturedTagParams,
    index$4_CreateListParams as CreateListParams,
    index$4_CreateMarkersParams as CreateMarkersParams,
    index$4_CreateScheduledStatusParams as CreateScheduledStatusParams,
    index$4_CreateStatusParams as CreateStatusParams,
    index$4_CreateStatusParamsBase as CreateStatusParamsBase,
    index$4_CreateStatusParamsWithMediaIds as CreateStatusParamsWithMediaIds,
    index$4_CreateStatusParamsWithStatus as CreateStatusParamsWithStatus,
    index$4_CreateStatusPollParam as CreateStatusPollParam,
    index$4_CustomEmojiRepository as CustomEmojiRepository,
    index$4_DirectoryOrderType as DirectoryOrderType,
    index$4_DirectoryRepository as DirectoryRepository,
    index$4_DomainBlockRepository as DomainBlockRepository,
    index$4_EmailRepository as EmailRepository,
    index$4_EndorsementRepository as EndorsementRepository,
    index$4_FavouriteRepository as FavouriteRepository,
    index$4_FeaturedTagRepository as FeaturedTagRepository,
    index$4_FetchMarkersParams as FetchMarkersParams,
    index$4_FetchRelationshipsParams as FetchRelationshipsParams,
    index$4_FollowAccountParams as FollowAccountParams,
    index$4_FollowedTagRepository as FollowedTagRepository,
    index$4_FollowRequestRepository as FollowRequestRepository,
    index$4_ListAccountStatusesParams as ListAccountStatusesParams,
    index$4_ListDirectoryParams as ListDirectoryParams,
    index$4_ListNotificationsParams as ListNotificationsParams,
    index$4_ListRepository as ListRepository,
    index$4_ListSuggestionParams as ListSuggestionParams,
    index$4_ListTimelineParams as ListTimelineParams,
    index$4_ListTrendsParams as ListTrendsParams,
    index$4_LookupAccountParams as LookupAccountParams,
    index$4_MarkerRepository as MarkerRepository,
    index$4_MuteAccountParams as MuteAccountParams,
    index$4_MuteRepository as MuteRepository,
    index$4_NotificationRepository as NotificationRepository,
    index$4_PollRepository as PollRepository,
    index$4_PreferenceRepository as PreferenceRepository,
    index$4_ProfileRepository as ProfileRepository,
    index$4_PushRepository as PushRepository,
    index$4_ReblogStatusParams as ReblogStatusParams,
    index$4_RemoveDomainBlockParams as RemoveDomainBlockParams,
    index$4_RemoveListAccountsParams as RemoveListAccountsParams,
    index$4_ReportAccountParams as ReportAccountParams,
    index$4_ReportRepository as ReportRepository,
    index$4_ScheduledStatusRepository as ScheduledStatusRepository,
    index$4_SearchAccountsParams as SearchAccountsParams,
    index$4_StatusRepository as StatusRepository,
    index$4_TagRepository as TagRepository,
    index$4_TimelineRepository as TimelineRepository,
    index$4_TranslateStatusParams as TranslateStatusParams,
    index$4_TrendRepository as TrendRepository,
    index$4_UpdateCredentialsParams as UpdateCredentialsParams,
    index$4_UpdateListParams as UpdateListParams,
    index$4_UpdateMediaAttachmentParams as UpdateMediaAttachmentParams,
    index$4_UpdateScheduledStatusParams as UpdateScheduledStatusParams,
    index$4_UpdateStatusParams as UpdateStatusParams,
    index$4_VotePollParams as VotePollParams,
    InstanceRepository$1 as InstanceRepository,
    MediaAttachmentRepository$1 as MediaAttachmentRepository,
    SearchParams$1 as SearchParams,
    SearchRepository$1 as SearchRepository,
    SearchType$1 as SearchType,
    SuggestionRepository$1 as SuggestionRepository,
    UpdateFilterParams$1 as UpdateFilterParams,
  };
}

export interface CreateFilterParams {
  /** String. The name of the filter group. */
  readonly title: string;
  /** Array of String. Where the filter should be applied. Specify at least one of home, notifications, public, thread, account. */
  readonly context: readonly FilterContext$1[] | null;
  /** String. The policy to be applied when the filter is matched. Specify warn or hide. */
  readonly filterAction?: FilterAction | null;
  /** Integer. How many seconds from now should the filter expire? */
  readonly expiresIn?: number | null;
  readonly keywordsAttributes?: {
    /** String. A keyword to be added to the newly-created filter group. */
    readonly keyword?: string | null;
    /** Boolean. Whether the keyword should consider word boundaries. */
    readonly wholeWord?: boolean | null;
  }[];
}
export interface UpdateFilterParams {
  /** String. The name of the filter group. */
  readonly title?: string;
  /** Array of String. Where the filter should be applied. Specify at least one of home, notifications, public, thread, account. */
  readonly context?: readonly FilterContext$1[] | null;
  /** String. The policy to be applied when the filter is matched. Specify warn or hide. */
  readonly filterAction?: FilterAction | null;
  /** Integer. How many seconds from now should the filter expire? */
  readonly expiresIn?: number | null;
  readonly keywordsAttributes?: readonly {
    /** String. Provide the ID of an existing keyword to modify it, instead of creating a new keyword. */
    readonly id?: string | null;
    /** String. A keyword to be added to the newly-created filter group. */
    readonly keyword?: string | null;
    /** Boolean. Whether the keyword should consider word boundaries. */
    readonly wholeWord?: boolean | null;
    /** Boolean. If true, will remove the keyword with the given ID */
    readonly _destroy?: boolean | null;
  }[];
}
export interface CreateFilterKeywordParams {
  /** String. The keyword to be added to the filter group. */
  readonly keyword: string;
  /** Boolean. Whether the keyword should consider word boundaries. */
  readonly wholeWord?: boolean | null;
}
export type UpdateFilterKeywordParams = CreateFilterKeywordParams;
export interface CreateFilterStatusParams {
  readonly statusId: string;
}
export interface FilterRepository {
  /**
   * View all filters
   * @return Array of Filter
   * @see https://docs.joinmastodon.org/methods/filters/#get
   */
  list(meta?: HttpMetaParams): Paginator<Filter$1[]>;
  /**
   * Create a filter group with the given parameters.
   * @param params Parameters
   * @return Filter
   * @see https://docs.joinmastodon.org/methods/filters/#create
   */
  create(
    params?: CreateFilterParams,
    meta?: HttpMetaParams<"json">,
  ): Promise<Filter$1>;
  $select(id: string): {
    /**
     * Obtain a single filter group owned by the current user.
     * @return Filter
     * @see https://docs.joinmastodon.org/methods/filters/#get-one
     */
    fetch(meta?: HttpMetaParams): Promise<Filter$1>;
    /**
     * Update a filter group with the given parameters.
     * @param params Parameters
     * @return Filter
     * @see https://docs.joinmastodon.org/methods/filters/#update
     */
    update(
      params?: UpdateFilterParams,
      meta?: HttpMetaParams<"json">,
    ): Promise<Filter$1>;
    /**
     * Delete a filter group with the given id.
     * @return N/A
     * @see https://docs.joinmastodon.org/methods/filters/#delete
     */
    remove(meta?: HttpMetaParams): Promise<void>;
    keywords: {
      /**
       * Add the given keyword to the specified filter group
       * @param id String. The ID of the Filter in the database.
       * @param params Parameters
       * @return FilterKeywords
       * @see https://docs.joinmastodon.org/methods/filters/#keywords-create
       */
      create(
        params: CreateFilterKeywordParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<FilterKeyword>;
      /**
       * List all keywords attached to the current filter group.
       * @returns Array of FilterKeyword
       * @see https://docs.joinmastodon.org/methods/filters/#keywords-get
       */
      list(meta?: HttpMetaParams): Paginator<FilterKeyword[]>;
    };
    statuses: {
      /**
       * Obtain a list of all status filters within this filter group.
       * @returns Array of FilterStatus
       * @see https://docs.joinmastodon.org/methods/filters/#statuses-get
       */
      list(meta?: HttpMetaParams): Paginator<FilterStatus[]>;
      /**
       * Add a status filter to the current filter group.
       * @param params
       * @returns FilterStatus
       * @see https://docs.joinmastodon.org/methods/filters/#statuses-add
       */
      create(
        params: CreateFilterStatusParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<FilterStatus>;
    };
  };
  keywords: {
    $select(id: string): {
      /**
       * Get one filter keyword by the given id.
       * @returns FilterKeyword
       * @see https://docs.joinmastodon.org/methods/filters/#keywords-get-one
       */
      fetch(meta?: HttpMetaParams): Paginator<FilterKeyword>;
      /**
       * Update the given filter keyword.
       * @param params Parameters
       * @return FilterKeywords
       * @see https://docs.joinmastodon.org/methods/filters/#keywords-update
       */
      update(
        params: CreateFilterKeywordParams,
        meta?: HttpMetaParams<"json">,
      ): Promise<FilterKeyword>;
      /**
       * Deletes the given filter keyword.
       * @returns empty object
       * @see https://docs.joinmastodon.org/methods/filters/#keywords-delete
       */
      remove(meta?: HttpMetaParams): Promise<void>;
    };
  };
  statuses: {
    $select(id: string): {
      /**
       * Obtain a single status filter.
       * @returns FilterStatus
       * @see https://docs.joinmastodon.org/methods/filters/#statuses-get-one
       */
      fetch(): Promise<FilterStatus>;
      /**
       * @returns FilterStatus
       * @see https://docs.joinmastodon.org/methods/filters/#statuses-get-one
       */
      remove(): Promise<FilterStatus>;
    };
  };
}

export interface InstanceRepository {
  /**
   * Information about the server.
   * @return Instance
   * @see https://docs.joinmastodon.org/methods/instance/
   */
  fetch(meta?: HttpMetaParams): Promise<Instance>;
}

export interface CreateMediaAttachmentParams {
  /** The file to be attached, using multipart form data. */
  readonly file: Blob | string;
  /** A plain-text description of the media, for accessibility purposes. */
  readonly description?: string | null;
  /** Two floating points (x,y), comma-delimited, ranging from -1.0 to 1.0 */
  readonly focus?: string | null;
  /** Custom thumbnail */
  readonly thumbnail?: Blob | string | null;
}
export interface CreateMediaAttachmentExtraParams {
  /** Wait resolving promise for the media to be uploaded. Defaults to `false` */
  readonly skipPolling?: boolean;
}
export interface MediaAttachmentRepository {
  /**
   * Creates an attachment to be used with a new status.
   * @param params Parameters
   * @return Attachment
   * @see https://docs.joinmastodon.org/methods/statuses/media/
   */
  create(
    params: CreateMediaAttachmentParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<MediaAttachment>;
}

export type SearchType = "accounts" | "hashtags" | "statuses";
export interface SearchParams extends DefaultPaginationParams {
  /** Attempt WebFinger lookup. Defaults to false. */
  readonly q: string;
  /** Enum(accounts, hashtags, statuses) */
  readonly type?: SearchType | null;
  /** Attempt WebFinger look-up */
  readonly resolve?: boolean | null;
  /** If provided, statuses returned will be authored only by this account */
  readonly accountId?: string | null;
  /** Filter out unreviewed tags? Defaults to false. Use true when trying to find trending tags. */
  readonly excludeUnreviewed?: boolean | null;
  /** Only include accounts that the user is following. Defaults to false. */
  readonly following?: boolean | null;
}
export interface SearchRepository {
  /**
   * Perform a search
   * @param params Parameters
   * @return Results
   * @see https://docs.joinmastodon.org/methods/search/
   */
  fetch(
    params: SearchParams,
    meta?: HttpMetaParams,
  ): Paginator<Search, SearchParams>;
}

export interface ListSuggestionsParams {
  /** Integer. Maximum number of results to return. Defaults to 40. */
  readonly limit?: number | null;
}
export interface SuggestionRepository {
  /**
   * View follow suggestions.
   * Accounts that are promoted by staff, or that the user has had past positive interactions with, but is not yet following.
   * @param params
   * @returns
   */
  list(
    params?: ListSuggestionsParams,
    meta?: HttpMetaParams,
  ): Paginator<Suggestion[], ListSuggestionsParams>;
}

export type index$3_CreateFilterKeywordParams = CreateFilterKeywordParams;
export type index$3_CreateFilterParams = CreateFilterParams;
export type index$3_CreateFilterStatusParams = CreateFilterStatusParams;
export type index$3_CreateMediaAttachmentExtraParams =
  CreateMediaAttachmentExtraParams;
export type index$3_CreateMediaAttachmentParams = CreateMediaAttachmentParams;
export type index$3_FilterRepository = FilterRepository;
export type index$3_InstanceRepository = InstanceRepository;
export type index$3_ListSuggestionsParams = ListSuggestionsParams;
export type index$3_MediaAttachmentRepository = MediaAttachmentRepository;
export type index$3_SearchParams = SearchParams;
export type index$3_SearchRepository = SearchRepository;
export type index$3_SearchType = SearchType;
export type index$3_SuggestionRepository = SuggestionRepository;
export type index$3_UpdateFilterKeywordParams = UpdateFilterKeywordParams;
export type index$3_UpdateFilterParams = UpdateFilterParams;
declare namespace index$3 {
  export type {
    index$3_CreateFilterKeywordParams as CreateFilterKeywordParams,
    index$3_CreateFilterParams as CreateFilterParams,
    index$3_CreateFilterStatusParams as CreateFilterStatusParams,
    index$3_CreateMediaAttachmentExtraParams as CreateMediaAttachmentExtraParams,
    index$3_CreateMediaAttachmentParams as CreateMediaAttachmentParams,
    index$3_FilterRepository as FilterRepository,
    index$3_InstanceRepository as InstanceRepository,
    index$3_ListSuggestionsParams as ListSuggestionsParams,
    index$3_MediaAttachmentRepository as MediaAttachmentRepository,
    index$3_SearchParams as SearchParams,
    index$3_SearchRepository as SearchRepository,
    index$3_SearchType as SearchType,
    index$3_SuggestionRepository as SuggestionRepository,
    index$3_UpdateFilterKeywordParams as UpdateFilterKeywordParams,
    index$3_UpdateFilterParams as UpdateFilterParams,
  };
}

export interface Client$2 {
  readonly v1: {
    readonly admin: AdminRepository;
    readonly accounts: AccountRepository$1;
    readonly announcements: AnnouncementRepository;
    readonly apps: AppRepository;
    readonly blocks: BlockRepository;
    readonly bookmarks: BookmarkRepository;
    readonly conversations: ConversationRepository;
    readonly customEmojis: CustomEmojiRepository;
    readonly directory: DirectoryRepository;
    readonly domainBlocks: DomainBlockRepository;
    readonly endorsements: EndorsementRepository;
    readonly favourites: FavouriteRepository;
    readonly featuredTags: FeaturedTagRepository;
    readonly filters: FilterRepository$1;
    readonly followRequests: FollowRequestRepository;
    readonly instance: InstanceRepository$1;
    readonly lists: ListRepository;
    readonly markers: MarkerRepository;
    readonly media: MediaAttachmentRepository$1;
    readonly mutes: MuteRepository;
    readonly notifications: NotificationRepository;
    readonly polls: PollRepository;
    readonly preferences: PreferenceRepository;
    readonly reports: ReportRepository;
    readonly scheduledStatuses: ScheduledStatusRepository;
    readonly search: SearchRepository$1;
    readonly statuses: StatusRepository;
    readonly suggestions: SuggestionRepository$1;
    readonly timelines: TimelineRepository;
    readonly trends: TrendRepository;
    readonly emails: EmailRepository;
    readonly tags: TagRepository;
    readonly followedTags: FollowedTagRepository;
    readonly push: PushRepository;
    readonly profile: ProfileRepository;
  };
  readonly v2: {
    readonly filters: FilterRepository;
    readonly instance: InstanceRepository;
    readonly media: MediaAttachmentRepository;
    readonly suggestions: SuggestionRepository;
    readonly search: SearchRepository;
  };
}

declare namespace index$2 {
  export { type Client$2 as Client, index$3 as v2, index$4 as v1 };
}

export interface RawEventOk {
  stream: string[];
  event: string;
  payload?: string;
}
export interface RawEventError {
  error: string;
}
export type RawEvent = RawEventOk | RawEventError;
export interface BaseEvent<T, U> {
  stream: string[];
  event: T;
  payload: U;
}
export type UpdateEvent = BaseEvent<"update", Status>;
export type DeleteEvent = BaseEvent<"delete", string>;
export type NotificationEvent = BaseEvent<"notification", Notification>;
export type FiltersChangedEvent = BaseEvent<"filters_changed", undefined>;
export type ConversationEvent = BaseEvent<"conversation", Conversation>;
export type AnnouncementEvent = BaseEvent<"announcement", Announcement>;
export type AnnouncementReactionEvent = BaseEvent<
  "announcement.reaction",
  Reaction
>;
export type AnnouncementDeleteEvent = BaseEvent<"announcement.delete", string>;
export type StatusUpdateEvent = BaseEvent<"status.update", Status>;
export type Event =
  | UpdateEvent
  | DeleteEvent
  | NotificationEvent
  | FiltersChangedEvent
  | ConversationEvent
  | AnnouncementEvent
  | AnnouncementReactionEvent
  | AnnouncementDeleteEvent
  | StatusUpdateEvent;

export interface SubscribeListParams {
  readonly list: string;
}
export interface SubscribeHashtagParams {
  readonly tag: string;
}
export interface Subscription {
  unsubscribe(): void;
  values(): AsyncIterableIterator<Event>;
  [Symbol.asyncIterator](): AsyncIterator<Event, undefined>;
  /**
   * @experimental This is an experimental API.
   */
  [Symbol.dispose](): void;
}
export interface Client$1 {
  public: {
    subscribe(): Subscription;
    media: {
      subscribe(): Subscription;
    };
    local: {
      subscribe(): Subscription;
      media: {
        subscribe(): Subscription;
      };
    };
    remote: {
      subscribe(): Subscription;
      media: {
        subscribe(): Subscription;
      };
    };
  };
  hashtag: {
    subscribe(params: SubscribeHashtagParams): Subscription;
    local: {
      subscribe(params: SubscribeHashtagParams): Subscription;
    };
  };
  list: {
    subscribe(params: SubscribeListParams): Subscription;
  };
  direct: {
    subscribe(): Subscription;
  };
  user: {
    subscribe(): Subscription;
    notification: {
      subscribe(): Subscription;
    };
  };
  close(): void;
  /** @internal */
  prepare(): Promise<void>;
}

export type index$1_AnnouncementDeleteEvent = AnnouncementDeleteEvent;
export type index$1_AnnouncementEvent = AnnouncementEvent;
export type index$1_AnnouncementReactionEvent = AnnouncementReactionEvent;
export type index$1_ConversationEvent = ConversationEvent;
export type index$1_DeleteEvent = DeleteEvent;
export type index$1_Event = Event;
export type index$1_FiltersChangedEvent = FiltersChangedEvent;
export type index$1_NotificationEvent = NotificationEvent;
export type index$1_RawEvent = RawEvent;
export type index$1_RawEventError = RawEventError;
export type index$1_RawEventOk = RawEventOk;
export type index$1_StatusUpdateEvent = StatusUpdateEvent;
export type index$1_SubscribeHashtagParams = SubscribeHashtagParams;
export type index$1_SubscribeListParams = SubscribeListParams;
export type index$1_Subscription = Subscription;
export type index$1_UpdateEvent = UpdateEvent;
declare namespace index$1 {
  export type {
    Client$1 as Client,
    index$1_AnnouncementDeleteEvent as AnnouncementDeleteEvent,
    index$1_AnnouncementEvent as AnnouncementEvent,
    index$1_AnnouncementReactionEvent as AnnouncementReactionEvent,
    index$1_ConversationEvent as ConversationEvent,
    index$1_DeleteEvent as DeleteEvent,
    index$1_Event as Event,
    index$1_FiltersChangedEvent as FiltersChangedEvent,
    index$1_NotificationEvent as NotificationEvent,
    index$1_RawEvent as RawEvent,
    index$1_RawEventError as RawEventError,
    index$1_RawEventOk as RawEventOk,
    index$1_StatusUpdateEvent as StatusUpdateEvent,
    index$1_SubscribeHashtagParams as SubscribeHashtagParams,
    index$1_SubscribeListParams as SubscribeListParams,
    index$1_Subscription as Subscription,
    index$1_UpdateEvent as UpdateEvent,
  };
}

export interface CreateTokenParamsWithPassword {
  readonly grantType: "password";
  readonly clientId: string;
  readonly clientSecret: string;
  readonly username: string;
  readonly password: string;
  readonly scope?: string;
}
export type CreateTokenParams = CreateTokenParamsWithPassword;
export interface TokenRepository {
  create(
    params: CreateTokenParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<Token>;
}

export interface RevokeTokenParams {
  /** The client ID, obtained during app registration. */
  readonly clientId: string;
  /** The client secret, obtained during app registration. */
  readonly clientSecret: string;
  /** The previously obtained token, to be invalidated. */
  readonly token: string;
}
export interface Client {
  readonly token: TokenRepository;
  /**
   * Revoke an access token to make it no longer valid for use.
   * @param params Form data parameters
   * @param meta HTTP metadata
   * @see https://docs.joinmastodon.org/methods/oauth/#revoke
   */
  revoke(
    params: RevokeTokenParams,
    meta?: HttpMetaParams<"multipart-form">,
  ): Promise<void>;
}

export type index_Client = Client;
export type index_CreateTokenParams = CreateTokenParams;
export type index_CreateTokenParamsWithPassword = CreateTokenParamsWithPassword;
export type index_RevokeTokenParams = RevokeTokenParams;
export type index_TokenRepository = TokenRepository;
declare namespace index {
  export type {
    index_Client as Client,
    index_CreateTokenParams as CreateTokenParams,
    index_CreateTokenParamsWithPassword as CreateTokenParamsWithPassword,
    index_RevokeTokenParams as RevokeTokenParams,
    index_TokenRepository as TokenRepository,
  };
}

export type mastodon_DefaultPaginationParams = DefaultPaginationParams;
export type mastodon_Direction = Direction;
export type mastodon_Paginator<Entity, Params = undefined> = Paginator<
  Entity,
  Params
>;
declare namespace mastodon {
  export {
    index as oauth,
    index$1 as streaming,
    index$2 as rest,
    index$5 as v2,
    index$6 as v1,
    type mastodon_DefaultPaginationParams as DefaultPaginationParams,
    type mastodon_Direction as Direction,
    type mastodon_Paginator as Paginator,
  };
}

export interface MastoHttpConfigProps {
  readonly url: string;
  readonly accessToken?: string;
  readonly timeout?: number;
  readonly requestInit?: Omit<RequestInit, "body" | "method">;
}

export interface WebSocketConfigProps {
  readonly streamingApiUrl: string;
  readonly retry?: boolean | number;
  readonly accessToken?: string;
  readonly useInsecureAccessToken?: boolean;
}

export interface LogConfigProps {
  readonly log?: LogType;
}
declare const createRestAPIClient: (
  props: MastoHttpConfigProps & LogConfigProps,
) => Client$2;
declare const createOAuthAPIClient: (
  props: MastoHttpConfigProps & LogConfigProps,
) => Client;
export interface WebSocketCustomImplProps {
  /** Custom WebSocket implementation. In Deno, you can use `WebSocket` to avoid potential errors. */
  readonly implementation?: unknown;
}
declare function createStreamingAPIClient(
  props: WebSocketConfigProps & LogConfigProps & WebSocketCustomImplProps,
): Client$1;

export {
  createOAuthAPIClient,
  createRestAPIClient,
  createStreamingAPIClient,
  MastoDeserializeError,
  mastodon,
  MastoHttpError,
  MastoInvalidArgumentError,
  MastoTimeoutError,
  MastoUnexpectedError,
  MastoWebSocketError,
};

// this will contain the number of tables
export enum Tables{
    tbl_User = 'Users',
    tbl_Post = 'Post',
    tbl_Like = 'tbl_PostLike',
    tbl_Follow = 'tbl_Follow',
    tbl_Conversation = 'tbl_Conversation',
    tbl_Message = 'Message',
    tbl_Comment = 'tbl_Comment',
    tbl_Conversation_Participants = 'Conversation_Participants',
    tbl_Post_View = 'tbl_Post_View',
    // tbl_post_like='tbl_PostLike',
    tbl_postMedia = 'tbl_PostMedia',
    tbl_Message_Attachment = 'Message_Attachment',
    tbl_Notification = 'tbl_Notification',
    tbl_Hashtag = 'tbl_Hashtag',
    tbl_PostHashtag = 'tbl_PostHashtag',
    tbl_Report = 'tbl_Report',
    tbl_FileDeleteRequest = 'FileDeleteRequest',
    tbl_Session = 'tbl_Session',
}

export class TableGroup{
public static readonly TABLES: Tables[] = [Tables.tbl_Message]
}

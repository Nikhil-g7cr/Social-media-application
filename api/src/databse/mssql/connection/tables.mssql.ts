// this will contain the number of tables
export enum Tables{
    tbl_User = 'Users',
    tbl_Post = 'Post',
    tbl_Like = 'tbl_PostLike',
    tbl_Follow = 'tbl_Follow',
    tbl_Conversation = 'tbl_Conversation',
    tbl_Message = 'tbl_Message',
    tbl_Comment = 'tbl_Comment',
    tbl_Conversation_Participants = 'Conversation_Participants',
    tbl_Post_View = 'tbl_Post_View',
    // tbl_post_like='tbl_PostLike',
    tbl_postMedia = 'tbl_PostMedia',
    tbl_Message_Attachment = 'Message_Attachment',

}

export class TableGroup{
public static readonly TABLES: Tables[] = [Tables.tbl_Message]
}
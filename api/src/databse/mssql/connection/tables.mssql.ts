// this will contain the number of tables
export enum Tables{
    tbl_User = 'tbl_User',
    tbl_Post = 'tbl_Post',
    tbl_Like = 'tbl_Like',
    tbl_Follow = 'tbl_Follow',
    tbl_Conversation = 'tbl_Conversation',
    tbl_Message = 'tbl_Message',
    tbl_Comment = 'tbl_Comment',
    tbl_Conversation_Participants = 'tbl_Conversation_Participants',
    tbl_Post_View = 'tbl_Post_View',
    tbl_Message_Attachment = 'tbl_Message_Attachment',

}

export class TableGroup{
public static readonly TABLES: Tables[] = [Tables.tbl_Message]
}
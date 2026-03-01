namespace SafecoreApi.Models
{
    public class Query
    {
        public int Id { get; set; }
        public string QueryId { get; set; }
        public string CaseId { get; set; }
        public string RaisedBy { get; set; }
        public string QueryText { get; set; }
        public string Status { get; set; }
    }
}

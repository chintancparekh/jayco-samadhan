namespace SafecoreApi.Models
{
    public class Grievance
    {
        public int Id { get; set; }
        public string GrievanceId { get; set; }
        public string CaseId { get; set; }
        public string RaisedBy { get; set; }
        public string Issue { get; set; }
        public string Status { get; set; }
    }
}

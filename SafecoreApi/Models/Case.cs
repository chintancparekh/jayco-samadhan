namespace SafecoreApi.Models
{
    public class Case
    {
        public int Id { get; set; }
        public string CaseId { get; set; }
        public string Buyer { get; set; }
        public string Seller { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}

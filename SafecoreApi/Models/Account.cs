namespace SafecoreApi.Models
{
    public class Account
    {
        public int Id { get; set; }
        public string InvoiceNo { get; set; }
        public string CaseId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public string Status { get; set; }
    }
}

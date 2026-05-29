using Microsoft.EntityFrameworkCore;
using SafecoreApi.Data;
using SafecoreApi.Services;

namespace SafecoreApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ?? DATABASE: use SQLite for Development, SQL Server otherwise
            builder.Services.AddDbContext<AppDbContext>(options =>
                {
                    if (builder.Environment.IsDevelopment())
                    {
                        var sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=dev.db";
                        options.UseSqlite(sqliteConn);
                    }
                    else
                    {
                        options.UseSqlServer(
                            builder.Configuration.GetConnectionString("DefaultConnection")
                        );
                    }
                }
            );

            builder.Services.AddSingleton<EmailService>();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // ?? CORS ADD HERE (IMPORTANT)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngular",
                    policy => policy.AllowAnyOrigin()
                                    .AllowAnyHeader()
                                    .AllowAnyMethod());
            });

            var app = builder.Build();

            // Ensure database exists in Development (SQLite) or apply migrations in non-Development
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                if (app.Environment.IsDevelopment())
                {
                    db.Database.EnsureCreated();
                }
                else
                {
                    db.Database.Migrate();
                }
            }

            // ?? swagger
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // ?? CORS USE HERE
            app.UseCors("AllowAngular");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MetaHuman.Backend.Models;
using MetaHuman.Backend.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace MetaHuman.Backend.Controllers
{
    [Authorize]

    // Ruta de bază va fi /api/masuratori (numele controlerului fără sufixul "Controller")
    [Route("api/[controller]")]
    [ApiController]
    public class MasuratoriController : ControllerBase
    
    {
        
        private readonly MetaHumanContext _context;

        // Injectăm instanța bazei de date (configurată anterior în Program.cs)
        public MasuratoriController(MetaHumanContext context)
        {
            _context = context;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("JWT merge");
        }

        // RUTA: POST /api/masuratori
        [HttpPost]
        public async Task<IActionResult> PreluareMasuratoare([FromBody] MasuratoareDTO dto)
        {
            // 1. Validăm dacă JSON-ul primit este corect formatat
            if (!ModelState.IsValid)
            {
                // Returnăm codul standardizat HTTP 400 Bad Request pentru JSON malformat [3]
                return BadRequest(ModelState); 
            }

            // 2. Mapăm DTO-ul (primit de la telefon) pe modelul C# al bazei de date
            var nouaMasuratoare = new Masuratoare
            {
                IdPacient = dto.IdPacient,
                TipParametru = dto.TipParametru,
                Valoare = dto.Valoare,
                UnitateMasura = dto.Unitate,
                DataOra = dto.DataOra,
                Sursa = dto.Sursa,
                Stare = "Prelucrat" // Setăm o stare inițială
            };

            try
            {
                // 3. Salvăm în PostgreSQL
                _context.Masuratori.Add(nouaMasuratoare);
                await _context.SaveChangesAsync();

                // 4. Returnăm răspunsul standardizat 201 Created către aplicația mobilă [3]
                return Created(string.Empty, new { mesaj = "Măsurătoarea a fost salvată cu succes." });
            }
            catch (Exception)
            {
                // În cazul în care cade conexiunea TCP cu PostgreSQL, returnăm eroare internă [3]
                return StatusCode(500, "A apărut o eroare la salvarea datelor în baza de date.");
            }
        }
    }
}
using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;

namespace MetaHuman.Backend.Services;

public class EcgService
{
    private readonly MetaHumanContext _context;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;
    private readonly IdentitateClinicalaResolver _identitateClinicala;

    public EcgService(
        MetaHumanContext context,
        IUtilizatorCurentAccessor utilizatorCurent,
        IdentitateClinicalaResolver identitateClinicala)
    {
        _context = context;
        _utilizatorCurent = utilizatorCurent;
        _identitateClinicala = identitateClinicala;
    }

    public async Task<RaspunsEcgDTO> SalveazaAsync(
        CerereEcgDTO cerere,
        CancellationToken cancellationToken = default)
    {
        if (!_utilizatorCurent.EstePacient)
            throw new AccesInterzisException("Doar pacienții pot trimite capturi ECG.");

        var idPacient = await _identitateClinicala.ObtineIdPacientCurentAsync(cancellationToken);
        if (!idPacient.HasValue || idPacient.Value != cerere.IdPacient)
            throw new AccesInterzisException("Nu puteți trimite ECG pentru alt pacient.");

        var inregistrare = new InregistrareECG
        {
            IdPacient = cerere.IdPacient,
            SecventaValori = cerere.SecventaValori,
            FrecventaEsantionare = cerere.FrecventaEsantionare,
            DurataCapturiiSec = cerere.DurataCapturiiSec,
            DataOra = DateTime.UtcNow,
            Observatii = cerere.Observatii?.Trim(),
            StareValidare = "InAsteptare"
        };

        _context.InregistrariECG.Add(inregistrare);
        await _context.SaveChangesAsync(cancellationToken);

        return new RaspunsEcgDTO
        {
            IdInregistrareEcg = inregistrare.IdInregistrareEcg,
            IdPacient = inregistrare.IdPacient,
            DataOra = inregistrare.DataOra,
            StareValidare = inregistrare.StareValidare
        };
    }
}

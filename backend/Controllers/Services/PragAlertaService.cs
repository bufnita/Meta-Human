using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class PragAlertaService
{
    private readonly MetaHumanContext _context;
    private readonly IdentitateClinicalaResolver _identitateClinicala;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;

    public PragAlertaService(
        MetaHumanContext context,
        IdentitateClinicalaResolver identitateClinicala,
        IUtilizatorCurentAccessor utilizatorCurent)
    {
        _context = context;
        _identitateClinicala = identitateClinicala;
        _utilizatorCurent = utilizatorCurent;
    }

    public async Task<RaspunsPragAlertaDTO> ConfigureazaAsync(
        int idPacient,
        CererePragAlertaDTO cerere,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuAccesAsync(idPacient, cancellationToken);
        var idMedic = await RezolvaIdMedicPentruPacientAsync(pacient, cancellationToken);

        var prag = new PragAlerta
        {
            IdPacient = idPacient,
            IdMedic = idMedic,
            TipParametru = cerere.TipParametru.Trim(),
            ValoareMinima = cerere.ValoareMinima,
            ValoareMaxima = cerere.ValoareMaxima,
            DurataPersistentaSec = cerere.DurataPersistentaSec,
            Activ = cerere.Activ
        };

        _context.PraguriAlerta.Add(prag);
        await _context.SaveChangesAsync(cancellationToken);

        return MapLaRaspuns(prag);
    }

    public async Task<IReadOnlyList<RaspunsPragAlertaDTO>> ObtinePentruPacientAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuAccesAsync(idPacient, cancellationToken);

        var praguri = await _context.PraguriAlerta
            .Where(p => p.IdPacient == idPacient)
            .OrderBy(p => p.TipParametru)
            .ToListAsync(cancellationToken);

        return praguri.Select(MapLaRaspuns).ToList();
    }

    private async Task<Pacient> ObtinePacientCuAccesAsync(
        int idPacient,
        CancellationToken cancellationToken)
    {
        var pacient = await _context.Pacienti
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPacient == idPacient, cancellationToken);

        if (pacient == null)
            throw new ResursaNegasitaException("Pacientul nu a fost găsit.");

        if (_utilizatorCurent.EsteAdmin)
            return pacient;

        var idMedic = await ObtineIdMedicObligatoriuAsync(cancellationToken);
        if (pacient.IdMedic != idMedic)
            throw new AccesInterzisException("Nu aveți acces la acest pacient.");

        return pacient;
    }

    private async Task<int> RezolvaIdMedicPentruPacientAsync(
        Pacient pacient,
        CancellationToken cancellationToken)
    {
        if (_utilizatorCurent.EsteAdmin)
            return pacient.IdMedic;

        var idMedic = await ObtineIdMedicObligatoriuAsync(cancellationToken);
        if (pacient.IdMedic != idMedic)
            throw new AccesInterzisException("Nu aveți acces la acest pacient.");

        return idMedic;
    }

    private async Task<int> ObtineIdMedicObligatoriuAsync(CancellationToken cancellationToken)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            throw new AccesInterzisException("Profilul de medic nu a fost găsit.");

        return idMedic.Value;
    }

    private static RaspunsPragAlertaDTO MapLaRaspuns(PragAlerta p) => new()
    {
        IdPrag = p.IdPrag,
        IdPacient = p.IdPacient,
        TipParametru = p.TipParametru,
        ValoareMinima = p.ValoareMinima,
        ValoareMaxima = p.ValoareMaxima,
        DurataPersistentaSec = p.DurataPersistentaSec,
        Activ = p.Activ
    };
}

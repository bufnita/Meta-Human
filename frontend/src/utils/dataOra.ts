const LOCALE = 'ro-RO'
const TIMEZONE = 'Europe/Bucharest'
const DATA_ORA_FARA_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/

const formatterDataOraRomania = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function formateazaDataOraRomania(dataOra?: string | null) {
  if (!dataOra) {
    return '-'
  }

  const dataConvertita = parseazaDataOraCaUtc(dataOra)

  if (!dataConvertita) {
    return '-'
  }

  const parti = formatterDataOraRomania.formatToParts(dataConvertita)
  const valori = Object.fromEntries(
    parti
      .filter((parte) =>
        ['day', 'month', 'year', 'hour', 'minute', 'second'].includes(parte.type),
      )
      .map((parte) => [parte.type, parte.value]),
  ) as Record<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second', string>

  return `${valori.day}.${valori.month}.${valori.year}, ${valori.hour}:${valori.minute}:${valori.second}`
}

function parseazaDataOraCaUtc(dataOra: string) {
  const valoareCuratata = dataOra.trim()

  if (!valoareCuratata) {
    return null
  }

  const valoareStandardizata = DATA_ORA_FARA_TIMEZONE.test(valoareCuratata)
    ? `${valoareCuratata.replace(' ', 'T')}Z`
    : valoareCuratata

  const dataConvertita = new Date(valoareStandardizata)

  if (Number.isNaN(dataConvertita.getTime())) {
    return null
  }

  return dataConvertita
}

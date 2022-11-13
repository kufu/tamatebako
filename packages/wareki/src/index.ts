const { WAREKI_START_YEARS, reg, selectGengo } = (() => {
  const REIWA = '令和' as const
  const HEISEI = '平成' as const
  const SHOWA = '昭和' as const
  const TAISHO = '大正' as const
  const MEIJI = '明治' as const
  type Geongo = typeof REIWA | typeof HEISEI | typeof SHOWA | typeof TAISHO | typeof MEIJI

  const REIWA_START_YEAR = 2019
  const HEISEI_START_YEAR = 1989
  const SHOWA_START_YEAR = 1926
  const TAISHO_START_YEAR = 1912
  const MEIJI_START_YEAR = 1868

  const SEPARATOR = '[:\\/\\-\\.\\s．年月日]'
  const WAREKI_BOUNDARYS = [
    [REIWA, REIWA_START_YEAR, 4, 30, HEISEI],
    [HEISEI, HEISEI_START_YEAR, 1, 7, SHOWA],
    [SHOWA, SHOWA_START_YEAR, 12, 24, TAISHO],
    [TAISHO, TAISHO_START_YEAR, 7, 29, MEIJI],
  ] as const
  const YEARS = {
    r: REIWA_START_YEAR,
    R: REIWA_START_YEAR,
    [REIWA]: REIWA_START_YEAR,
    h: HEISEI_START_YEAR,
    H: HEISEI_START_YEAR,
    [HEISEI]: HEISEI_START_YEAR,
    s: SHOWA_START_YEAR,
    S: SHOWA_START_YEAR,
    [SHOWA]: SHOWA_START_YEAR,
    t: TAISHO_START_YEAR,
    T: TAISHO_START_YEAR,
    [TAISHO]: TAISHO_START_YEAR,
    m: MEIJI_START_YEAR,
    M: MEIJI_START_YEAR,
    [MEIJI]: MEIJI_START_YEAR,
  } as const

  return {
    WAREKI_START_YEARS: YEARS,
    reg: {
      dateString: new RegExp(
        `^([0-9]{4})(${SEPARATOR})?([0-9]{1,2})(${SEPARATOR})?([0-9]{1,2})([\\s．]([0-9]{2}):([0-9]{2})$)?`,
      ),
      wareki: new RegExp(
        `^(${Object.keys(YEARS).join(
          '|',
        )})([0-9]{1,2})(${SEPARATOR})([0-9]{1,2})(${SEPARATOR})([0-9]{1,2})(${SEPARATOR}?)$`,
      ),
    },
    selectGengo: (year: number, month: number, date: number): Geongo => {
      for (const [modern, boundaryYear, boundaryMonth, boundaryDay, ancient] of WAREKI_BOUNDARYS) {
        if (year > boundaryYear) {
          return modern
        } else if (year === boundaryYear) {
          if (month > boundaryMonth || (month === boundaryMonth && date > boundaryDay)) {
            return modern
          }
          return ancient
        }
      }

      return MEIJI
    },
  }
})()
// TODO: ほかの全角文字も半角に治す必要があるかも？
const fullWidthToHalfWidth = (dateString: string) =>
  dateString.replace(/[ａ-ｚＡ-Ｚ０-９．]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

type Result<T> = {
  isValid: boolean
  result: T
  formatted: string
}

export function dateToWareki(d: string | Date): Result<string> {
  const dateString = d instanceof Date ? `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}` : d
  const formatted = fullWidthToHalfWidth(dateString)
  const matcher = formatted.match(reg.dateString)

  if (!matcher) {
    return {
      isValid: false,
      result: dateString,
      formatted,
    }
  }

  const year = Number(matcher[1])
  const month = Number(matcher[3])
  const date = Number(matcher[5])

  const gengo = selectGengo(year, month, date)
  // 和暦は1年から始まるので + 1 が必要
  const warekiYear = year - WAREKI_START_YEARS[gengo] + 1

  return {
    isValid: true,
    result: `${gengo}${warekiYear === 1 ? '元' : warekiYear}年${month}月${date}日`,
    formatted,
  }
}

export function warekiToDate(wareki: string): Result<Date> {
  const formatted = fullWidthToHalfWidth(wareki)

  // parse as japanese era
  const matchedWareki = formatted.match(reg.wareki)

  if (matchedWareki) {
    const baseYear = WAREKI_START_YEARS[matchedWareki[1] as keyof typeof WAREKI_START_YEARS]

    return {
      isValid: true,
      // 和暦は1年から始まるので - 1 が必要
      result: new Date(
        baseYear + Number(matchedWareki[2]) - 1,
        Number(matchedWareki[4]) - 1,
        Number(matchedWareki[6]),
      ),
      formatted,
    }
  }

  // parse as A.D.
  const matchedDate = formatted.match(reg.dateString)

  if (matchedDate) {
    return {
      isValid: true,
      result: new Date(Number(matchedDate[1]), Number(matchedDate[3]) - 1, Number(matchedDate[5])),
      formatted,
    }
  }

  return {
    isValid: false,
    result: new Date(formatted),
    formatted,
  }
}

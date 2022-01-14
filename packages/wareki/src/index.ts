class JpnEra {
  from: Date
  constructor(from: Date) {
    this.from = from
  }

  getADYear(year: number): number {
    return year + this.from.getFullYear() - 1
  }
}

const meiji = new JpnEra(new Date(1868, 9, 23))
const taisho = new JpnEra(new Date(1912, 6, 30))
const showa = new JpnEra(new Date(1926, 11, 25))
const heisei = new JpnEra(new Date(1989, 0, 8))
const reiwa = new JpnEra(new Date(2019, 4, 1))

const jpnEraSignMap = new Map<string, JpnEra>([
  ['明治', meiji],
  ['m', meiji],
  ['M', meiji],
  ['Ｍ', meiji],
  ['大正', taisho],
  ['t', taisho],
  ['T', taisho],
  ['Ｔ', taisho],
  ['昭和', showa],
  ['s', showa],
  ['S', showa],
  ['Ｓ', showa],
  ['平成', heisei],
  ['h', heisei],
  ['H', heisei],
  ['Ｈ', heisei],
  ['令和', reiwa],
  ['r', reiwa],
  ['R', reiwa],
  ['Ｒ', reiwa],
])
const jpnEraSigns = Array.from(jpnEraSignMap.keys())

const gengos = ['令和', '平成', '昭和', '大正', '明治'] as const
type Gengo = typeof gengos[number]

const REIWA = '令和' as const
const HEISEI = '平成' as const
const SHOWA = '昭和' as const
const TAISHO = '大正' as const
const MEIJI = '明治' as const
const ERA_RANGE = [
  [REIWA, 2019, 4, 30, HEISEI],
  [HEISEI, 1989, 1, 7, SHOWA],
  [SHOWA, 1926, 12, 24, TAISHO],
  [TAISHO, 1912, 7, 29, MEIJI],
] as const

// this regexp includes [:], [/], [-], [.], [\s], [．], [年], [月], [日]
const dateSeparatorReg = '[:\\/\\-\\.\\s．年月日]'

// to 令和2年1月1日
// 2022/12/25 10:20

/*
{
  isValidWareki: boolean,
  formatted: string
}
*/

// export function isValidDateString(str: string): boolean {
//   const rawDateString =
//     date instanceof Date ? `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` : date
//   const dateString = rawDateString.replace(/[０-９．]/g, (s) =>
//     String.fromCharCode(s.charCodeAt(0) - 0xfee0),
//   )

//   const matcher = dateString.match(
//     new RegExp(
//       `^([0-9]{4})(${dateSeparatorReg})?([0-9]{1,2})(${dateSeparatorReg})?([0-9]{1,2})([\\s．]([0-9]{2}):([0-9]{2})$)?`,
//     ),
//   )
// }

type Result<T> = {
  isValid: boolean
  result: T
}

export function dateToWareki(date: string | Date): Result<string> {
  const rawDateString =
    date instanceof Date ? `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` : date
  const dateString = rawDateString.replace(/[０-９．]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  )

  const matcher = dateString.match(
    new RegExp(
      `^([0-9]{4})(${dateSeparatorReg})?([0-9]{1,2})(${dateSeparatorReg})?([0-9]{1,2})([\\s．]([0-9]{2}):([0-9]{2})$)?`,
    ),
  )

  if (!matcher) {
    return {
      isValid: false,
      result: rawDateString,
    }
  }

  const year = Number(matcher[1])
  const month = Number(matcher[3])
  const day = Number(matcher[5])

  const gengo = adDate2EraSign(year, month, day)
  // 和暦は1年から始まるので + 1 が必要
  const warekiYear = year - eraSign2ADYear(gengo) + 1

  return {
    isValid: true,
    result: `${gengo}${warekiYear === 1 ? '元' : warekiYear}年${month}月${day}日`,
  }
}

const adDate2EraSign = (year: number, month: number, day: number): Gengo => {
  for (const [modern, boundaryYear, boundaryMonth, boundaryDay, ancient] of ERA_RANGE) {
    if (year > boundaryYear) {
      return modern
    } else if (year === boundaryYear) {
      if (month > boundaryMonth || (month === boundaryMonth && day > boundaryDay)) {
        return modern
      }
      return ancient
    }
  }

  return MEIJI
}

// 日本の年号から西暦に変換します。
const eraSign2ADYear = (gengo: Gengo): number => {
  return (jpnEraSignMap.get(gengo)?.from || meiji.from).getFullYear()
}

export function warekiToDate(wareki: string): Date {
  // convert number from full-width to half-width
  // TODO: ほかの全角文字も半角に治すようにしたほうが良さそう
  const converted = wareki.replace(/[０-９．]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  )

  const matchedJpnEra = converted.match(
    `^(${jpnEraSigns.join(
      '|',
    )})([0-9]{1,2})(${dateSeparatorReg})([0-9]{1,2})(${dateSeparatorReg})([0-9]{1,2})(${dateSeparatorReg}?)$`,
  )
  if (matchedJpnEra) {
    // parse as japanese era
    const eraSign = matchedJpnEra[1]
    const year = Number(matchedJpnEra[2])
    const month = Number(matchedJpnEra[4])
    const date = Number(matchedJpnEra[6])
    const jpnEra = jpnEraSignMap.get(eraSign)
    if (jpnEra) {
      return new Date(jpnEra.getADYear(year), month - 1, date)
    }
  }

  // parse as A.D.
  const matchedAD = converted.match(
    `^([0-9]{4})(${dateSeparatorReg})?([0-9]{1,2})(${dateSeparatorReg})?([0-9]{1,2})(${dateSeparatorReg})?`,
  )
  if (matchedAD) {
    const year = Number(matchedAD[1])
    const month = Number(matchedAD[3])
    const date = Number(matchedAD[5])
    return new Date(year, month - 1, date)
  }

  // TODO テスト追加する&エラー文言や内容を検討する
  throw Error('hoge')
}

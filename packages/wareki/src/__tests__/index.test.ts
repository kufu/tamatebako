import { dateToWareki, warekiToDate } from '../index'

const fullWidthToHalfWidth = (dateString: string) =>
  dateString.replace(/[ａ-ｚＡ-Ｚ０-９．]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

describe('wareki', () => {
  describe('dateToWareki', () => {
    it('Date を和暦に変換できること', () => {
      ;[
        ['令和4年1月1日', new Date(2022, 1 - 1, 1)],
        ['令和元年5月1日', new Date(2019, 5 - 1, 1)],
        ['平成31年4月30日', new Date(2019, 4 - 1, 30)],
        ['平成元年1月8日', new Date(1989, 1 - 1, 8)],
        ['昭和64年1月7日', new Date(1989, 1 - 1, 7)],
        ['昭和元年12月25日', new Date(1926, 12 - 1, 25)],
        ['大正15年12月24日', new Date(1926, 12 - 1, 24)],
        ['大正元年7月30日', new Date(1912, 7 - 1, 30)],
        ['明治45年7月29日', new Date(1912, 7 - 1, 29)],
        ['明治元年1月25日', new Date(1868, 1 - 1, 25)],
        ['明治元年1月24日', new Date(1868, 1 - 1, 24)],
        ['明治元年1月1日', new Date(1868, 1 - 1, 1)],
        ['明治0年12月31日', new Date(1867, 12 - 1, 31)],
        ['明治0年1月25日', new Date(1867, 1 - 1, 25)],
        ['明治0年1月24日', new Date(1867, 1 - 1, 24)],
      ].forEach(([exptected, date]) => {
        const d = date as Date
        const actual = dateToWareki(d)

        expect(actual.isValid).toBeTruthy()
        expect(actual.result).toBe(exptected)
        expect(actual.formatted).toBe(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`)
      })
    })

    it('StringDate を和暦に変換できること', () => {
      ;[
        ['令和4年1月1日', '2022/1/1'],
        ['令和4年1月1日', '2022/01/01'],
        ['令和4年1月1日', '20220101'],
        ['令和4年1月1日', '２０２２/１/１'],
        ['令和元年5月1日', '2019/5/1'],
        ['平成31年4月30日', '2019/4/30'],
        ['平成元年1月8日', '19890108'],
        ['昭和64年1月7日', '19890107'],
        ['昭和元年12月25日', '1926/12/25'],
        ['大正15年12月24日', '1926/12/24'],
        ['大正元年7月30日', '1912/07/30'],
        ['明治45年7月29日', '1912/07/29'],
        ['明治45年1月25日', '1912/01/25'],
        ['明治45年1月24日', '1912/01/24'],
        ['明治元年1月1日', '1868/1/1'],
        ['明治0年12月31日', '1867/12/31'],
        ['明治0年1月25日', '1867/1/25'],
        ['明治0年1月24日', '1867/1/24'],
      ].forEach(([exptected, date]) => {
        const actual = dateToWareki(date)

        expect(actual.isValid).toBeTruthy()
        expect(actual.result).toBe(exptected)
        expect(actual.formatted).toBe(fullWidthToHalfWidth(date))
      })
    })
  })

  describe('warekiToDate', () => {
    it('parse a date string of Meiji', () => {
      const expected = {
        isValid: true,
        result: new Date(1869, 0, 1),
      }
      expect(warekiToDate('明治2年1月1日')).toEqual({
        ...expected,
        formatted: '明治2年1月1日',
      })
      expect(warekiToDate('m2-1-1')).toEqual({
        ...expected,
        formatted: 'm2-1-1',
      })
      expect(warekiToDate('M2-1-1')).toEqual({
        ...expected,
        formatted: 'M2-1-1',
      })
      expect(warekiToDate('Ｍ2-1-1')).toEqual({
        ...expected,
        formatted: 'M2-1-1',
      })
    })

    it('parse a date string of Taisho', () => {
      const expected = {
        isValid: true,
        result: new Date(1913, 0, 1),
      }
      expect(warekiToDate('大正2年1月1日')).toEqual({
        ...expected,
        formatted: '大正2年1月1日',
      })
      expect(warekiToDate('t2-1-1')).toEqual({
        ...expected,
        formatted: 't2-1-1',
      })
      expect(warekiToDate('T2-1-1')).toEqual({
        ...expected,
        formatted: 'T2-1-1',
      })
      expect(warekiToDate('Ｔ2-1-1')).toEqual({
        ...expected,
        formatted: 'T2-1-1',
      })
    })

    it('parse a date string of Showa', () => {
      const expected = {
        isValid: true,
        result: new Date(1927, 0, 1),
      }
      expect(warekiToDate('昭和2年1月1日')).toEqual({
        ...expected,
        formatted: '昭和2年1月1日',
      })
      expect(warekiToDate('s2-1-1')).toEqual({
        ...expected,
        formatted: 's2-1-1',
      })
      expect(warekiToDate('S2-1-1')).toEqual({
        ...expected,
        formatted: 'S2-1-1',
      })
      expect(warekiToDate('Ｓ2-1-1')).toEqual({
        ...expected,
        formatted: 'S2-1-1',
      })
    })

    it('parse a date string of Heisei', () => {
      const expected = {
        isValid: true,
        result: new Date(1990, 0, 1),
      }
      expect(warekiToDate('平成2年1月1日')).toEqual({
        ...expected,
        formatted: '平成2年1月1日',
      })
      expect(warekiToDate('h2-1-1')).toEqual({
        ...expected,
        formatted: 'h2-1-1',
      })
      expect(warekiToDate('H2-1-1')).toEqual({
        ...expected,
        formatted: 'H2-1-1',
      })
      expect(warekiToDate('Ｈ2-1-1')).toEqual({
        ...expected,
        formatted: 'H2-1-1',
      })
    })

    it('parse a date string of Reiwa', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('令和2年1月1日')).toEqual({
        ...expected,
        formatted: '令和2年1月1日',
      })
      expect(warekiToDate('r2-1-1')).toEqual({
        ...expected,
        formatted: 'r2-1-1',
      })
      expect(warekiToDate('R2-1-1')).toEqual({
        ...expected,
        formatted: 'R2-1-1',
      })
      expect(warekiToDate('Ｒ2-1-1')).toEqual({
        ...expected,
        formatted: 'R2-1-1',
      })
    })

    it('parse a date string of japanese era that is an expected format', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('r2:1:1')).toEqual({
        ...expected,
        formatted: 'r2:1:1',
      })
      expect(warekiToDate('r2/1/1')).toEqual({
        ...expected,
        formatted: 'r2/1/1',
      })
      expect(warekiToDate('r2-1-1')).toEqual({
        ...expected,
        formatted: 'r2-1-1',
      })
      expect(warekiToDate('r2.1.1')).toEqual({
        ...expected,
        formatted: 'r2.1.1',
      })
      expect(warekiToDate('r2 1 1')).toEqual({
        ...expected,
        formatted: 'r2 1 1',
      })
      expect(warekiToDate('r2．1．1')).toEqual({
        ...expected,
        formatted: 'r2.1.1',
      })
      expect(warekiToDate('r2年1月1日')).toEqual({
        ...expected,
        formatted: 'r2年1月1日',
      })
      expect(warekiToDate('r02:01:01')).toEqual({
        ...expected,
        formatted: 'r02:01:01',
      })
      expect(warekiToDate('r10:12:31')).toEqual({
        isValid: true,
        result: new Date(2028, 11, 31),
        formatted: 'r10:12:31',
      })
    })

    it('parse date string of A.D. that is an expected format', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('2020:1:1')).toEqual({
        ...expected,
        formatted: '2020:1:1',
      })
      expect(warekiToDate('2020/1/1')).toEqual({
        ...expected,
        formatted: '2020/1/1',
      })
      expect(warekiToDate('2020-1-1')).toEqual({
        ...expected,
        formatted: '2020-1-1',
      })
      expect(warekiToDate('2020.1.1')).toEqual({
        ...expected,
        formatted: '2020.1.1',
      })
      expect(warekiToDate('2020 1 1')).toEqual({
        ...expected,
        formatted: '2020 1 1',
      })
      expect(warekiToDate('2020．1．1')).toEqual({
        ...expected,
        formatted: '2020.1.1',
      })
      expect(warekiToDate('2020年1月1日')).toEqual({
        ...expected,
        formatted: '2020年1月1日',
      })
      expect(warekiToDate('20200101')).toEqual({
        ...expected,
        formatted: '20200101',
      })
      expect(warekiToDate('1999:12:31')).toEqual({
        isValid: true,
        result: new Date(1999, 11, 31),
        formatted: '1999:12:31',
      })
    })
  })
})

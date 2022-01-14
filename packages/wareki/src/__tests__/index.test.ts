import { dateToWareki, warekiToDate } from '../index'

describe('wareki', () => {
  describe('dateToWareki', () => {
    it('Date を和暦に変換できること', () => {
      Object.entries({
        令和4年1月1日: new Date(2022, 1 - 1, 1),
        令和元年5月1日: new Date(2019, 5 - 1, 1),
        平成31年4月30日: new Date(2019, 4 - 1, 30),
        平成元年1月8日: new Date(1989, 1 - 1, 8),
        昭和64年1月7日: new Date(1989, 1 - 1, 7),
        昭和元年12月25日: new Date(1926, 12 - 1, 25),
        大正15年12月24日: new Date(1926, 12 - 1, 24),
        大正元年7月30日: new Date(1912, 7 - 1, 30),
        明治45年7月29日: new Date(1912, 7 - 1, 29),
        明治元年1月25日: new Date(1868, 1 - 1, 25),
        明治元年1月24日: new Date(1868, 1 - 1, 24),
        明治元年1月1日: new Date(1868, 1 - 1, 1),
        明治0年12月31日: new Date(1867, 12 - 1, 31),
        明治0年1月25日: new Date(1867, 1 - 1, 25),
        明治0年1月24日: new Date(1867, 1 - 1, 24),
      }).forEach(([exptected, date]) => {
        const actual = dateToWareki(date)

        expect(actual.isValid).toBeTruthy()
        expect(actual.result).toBe(exptected)
      })
    })
  })

  describe('warekiToDate', () => {
    it('parse a date string of Meiji', () => {
      const expected = {
        isValid: true,
        result: new Date(1869, 0, 1),
      }
      expect(warekiToDate('明治2年1月1日')).toEqual(expected)
      expect(warekiToDate('m2-1-1')).toEqual(expected)
      expect(warekiToDate('M2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｍ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Taisho', () => {
      const expected = {
        isValid: true,
        result: new Date(1913, 0, 1),
      }
      expect(warekiToDate('大正2年1月1日')).toEqual(expected)
      expect(warekiToDate('t2-1-1')).toEqual(expected)
      expect(warekiToDate('T2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｔ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Showa', () => {
      const expected = {
        isValid: true,
        result: new Date(1927, 0, 1),
      }
      expect(warekiToDate('昭和2年1月1日')).toEqual(expected)
      expect(warekiToDate('s2-1-1')).toEqual(expected)
      expect(warekiToDate('S2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｓ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Heisei', () => {
      const expected = {
        isValid: true,
        result: new Date(1990, 0, 1),
      }
      expect(warekiToDate('平成2年1月1日')).toEqual(expected)
      expect(warekiToDate('h2-1-1')).toEqual(expected)
      expect(warekiToDate('H2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｈ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Reiwa', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('令和2年1月1日')).toEqual(expected)
      expect(warekiToDate('r2-1-1')).toEqual(expected)
      expect(warekiToDate('R2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｒ2-1-1')).toEqual(expected)
    })

    it('parse a date string of japanese era that is an expected format', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('r2:1:1')).toEqual(expected)
      expect(warekiToDate('r2/1/1')).toEqual(expected)
      expect(warekiToDate('r2-1-1')).toEqual(expected)
      expect(warekiToDate('r2.1.1')).toEqual(expected)
      expect(warekiToDate('r2 1 1')).toEqual(expected)
      expect(warekiToDate('r2．1．1')).toEqual(expected)
      expect(warekiToDate('r2年1月1日')).toEqual(expected)
      expect(warekiToDate('r02:01:01')).toEqual(expected)
      expect(warekiToDate('r10:12:31')).toEqual({
        isValid: true,
        result: new Date(2028, 11, 31),
      })
    })

    it('parse date string of A.D. that is an expected format', () => {
      const expected = {
        isValid: true,
        result: new Date(2020, 0, 1),
      }
      expect(warekiToDate('2020:1:1')).toEqual(expected)
      expect(warekiToDate('2020/1/1')).toEqual(expected)
      expect(warekiToDate('2020-1-1')).toEqual(expected)
      expect(warekiToDate('2020.1.1')).toEqual(expected)
      expect(warekiToDate('2020 1 1')).toEqual(expected)
      expect(warekiToDate('2020．1．1')).toEqual(expected)
      expect(warekiToDate('2020年1月1日')).toEqual(expected)
      expect(warekiToDate('20200101')).toEqual(expected)
      expect(warekiToDate('1999:12:31')).toEqual({
        isValid: true,
        result: new Date(1999, 11, 31),
      })
    })
  })
})

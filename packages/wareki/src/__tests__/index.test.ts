import { warekiToDate } from '../index'

describe('datePickerHelper', () => {
  describe('warekiToDate', () => {
    it('parse a date string of Meiji', () => {
      const expected = new Date(1869, 0, 1)
      expect(warekiToDate('明治2年1月1日')).toEqual(expected)
      expect(warekiToDate('m2-1-1')).toEqual(expected)
      expect(warekiToDate('M2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｍ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Taisho', () => {
      const expected = new Date(1913, 0, 1)
      expect(warekiToDate('大正2年1月1日')).toEqual(expected)
      expect(warekiToDate('t2-1-1')).toEqual(expected)
      expect(warekiToDate('T2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｔ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Showa', () => {
      const expected = new Date(1927, 0, 1)
      expect(warekiToDate('昭和2年1月1日')).toEqual(expected)
      expect(warekiToDate('s2-1-1')).toEqual(expected)
      expect(warekiToDate('S2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｓ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Heisei', () => {
      const expected = new Date(1990, 0, 1)
      expect(warekiToDate('平成2年1月1日')).toEqual(expected)
      expect(warekiToDate('h2-1-1')).toEqual(expected)
      expect(warekiToDate('H2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｈ2-1-1')).toEqual(expected)
    })

    it('parse a date string of Reiwa', () => {
      const expected = new Date(2020, 0, 1)
      expect(warekiToDate('令和2年1月1日')).toEqual(expected)
      expect(warekiToDate('r2-1-1')).toEqual(expected)
      expect(warekiToDate('R2-1-1')).toEqual(expected)
      expect(warekiToDate('Ｒ2-1-1')).toEqual(expected)
    })

    it('parse a date string of japanese era that is an expected format', () => {
      const expected = new Date(2020, 0, 1)
      expect(warekiToDate('r2:1:1')).toEqual(expected)
      expect(warekiToDate('r2/1/1')).toEqual(expected)
      expect(warekiToDate('r2-1-1')).toEqual(expected)
      expect(warekiToDate('r2.1.1')).toEqual(expected)
      expect(warekiToDate('r2 1 1')).toEqual(expected)
      expect(warekiToDate('r2．1．1')).toEqual(expected)
      expect(warekiToDate('r2年1月1日')).toEqual(expected)
      expect(warekiToDate('r02:01:01')).toEqual(expected)
      expect(warekiToDate('r10:12:31')).toEqual(new Date(2028, 11, 31))
    })

    it('parse date string of A.D. that is an expected format', () => {
      const expected = new Date(2020, 0, 1)
      expect(warekiToDate('2020:1:1')).toEqual(expected)
      expect(warekiToDate('2020/1/1')).toEqual(expected)
      expect(warekiToDate('2020-1-1')).toEqual(expected)
      expect(warekiToDate('2020.1.1')).toEqual(expected)
      expect(warekiToDate('2020 1 1')).toEqual(expected)
      expect(warekiToDate('2020．1．1')).toEqual(expected)
      expect(warekiToDate('2020年1月1日')).toEqual(expected)
      expect(warekiToDate('20200101')).toEqual(expected)
      expect(warekiToDate('1999:12:31')).toEqual(new Date(1999, 11, 31))
    })
  })
})

import fetch from 'cross-fetch'
import taxRates from './data/taxRate.json'

/**
 * Get site titles of cool websites.
 *
 * Task: Can we change this to make the requests async so they are all fetched at once then when they are done, return all
 * the titles and make this function faster?
 *
 * @returns array of strings
 */
export async function returnSiteTitles() {
  const urls = [
    'https://patientstudio.com/',
    'https://www.startrek.com/',
    'https://www.starwars.com/',
    'https://www.neowin.net/'
  ]

  const titles: string[] = []
  const respones = await Promise.all(urls.map(url => fetch(url, { method: 'GET' }).then(res => res.text())))

  respones.forEach(response => {
    const match = response.match(/<title>(.*?)<\/title>/)

    if (match?.length) {
      titles.push(match[1])
    }
  })

  return titles
}

/**
 * Count the tags and organize them into an array of objects.
 *
 * Task: That's a lot of loops; can you refactor this to have the least amount of loops possible.
 * The test is also failing for some reason.
 *
 * @param localData array of objects
 * @returns array of objects
 */
export function findTagCounts(localData: Array<SampleDateRecord>): Array<TagCounts> {
  const tagCounts = localData.reduce((map: Map<string, number>, data) => {
    for (const tag of data.tags)
      map.set(tag, (map.get(tag) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const totTags: Array<TagCounts> = [];
  tagCounts.forEach((count, tag) => totTags.push({ tag, count}));

  return totTags;
}

/**
 * Calcualte total price
 *
 * Task: Write a function that reads in data from `importedItems` array (which is imported above) and calculates the total price, including taxes based on each
 * countries tax rate.
 *
 * Here are some useful formulas and infomration:
 *  - import cost = unit price * quantity * importTaxRate
 *  - total cost = import cost + (unit price * quantity)
 *  - the "importTaxRate" is based on they destiantion country
 *  - if the imported item is on the "category exceptions" list, then no tax rate applies
 */
export function calcualteImportCost(importedItems: Array<ImportedItem>): Array<ImportCostOutput> {
  const costs: Array<ImportCostOutput> = []

  importedItems.map(item => {
    const name = item.name
    const subtotal = item.unitPrice * item.quantity
    let taxRate = 0

    const individualTaxInfo = taxRates.find(({ country }) => country === item.countryDestination) // get the tax information for destination of current item

    if (!individualTaxInfo?.categoryExceptions.includes(item.category))
      taxRate = individualTaxInfo ? individualTaxInfo.importTaxRate : 0

    costs.push({
      name,
      subtotal,
      importCost: subtotal * taxRate,
      totalCost: subtotal * taxRate + subtotal
    })
  })

  return costs
}

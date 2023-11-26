import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import * as dotenv from 'dotenv';

dotenv.config();

async function fetchPage(url: string) {
  const response = await axios.get(url);
  return response.data;
}

function extractLinks($: CheerioAPI) {
  return $('a')
    .map((index, element) => $(element).attr('href'))
    .toArray()
    .filter((link) => link.startsWith('/'))
    .map((link) => link.replace('/', '').split('#')[0]);
}

async function getSubLinks(
  path: string,
  baseUrl: string,
  websiteLinks: Set<string>
) {
  const url = `${baseUrl}/${path}`;

  try {
    const html = await fetchPage(url);
    const $ = load(html);
    const currPageLinks = extractLinks($);
    for (const link of currPageLinks) {
      if (!websiteLinks.has(link)) {
        websiteLinks.add(link);
        await getSubLinks(link, baseUrl, websiteLinks);
      }
    }
  } catch (error) {
    // console.log(error);
  }

  return websiteLinks;
}

async function getWebSite() {
  const baseUrl = process.env.BASE_URL!;
  const websiteLinks = new Set<string>();
  const informationalLinks = await getSubLinks('', baseUrl, websiteLinks);

  for (const link of informationalLinks) {
    const url = `${baseUrl}/${link}`;
    const html = await fetchPage(url);
    const $ = load(html);
    const paragraphTexts = $('p')
      .map((index, element) => $(element).text())
      .get();

    console.log('URL: ', url);
    console.log(paragraphTexts);
  }
}

getWebSite();

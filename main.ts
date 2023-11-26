import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import loadEnv from './envUtil';

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
  websiteLinks.add('');
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
  } catch (e) {
    const error = e as Error;
    console.log(error.message);
    console.log(error.stack);
  }

  return websiteLinks;
}

async function getInformation() {
  const [baseUrl, openAiKey] = loadEnv(['BASE_URL', 'OPEN_AI_KEY']);
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
    console.log(openAiKey);
  }
}

getInformation();

export const Pattern = /\<tr\>.*?\<td\>.*?\<\/td\>.*?\<td\>(?<name>[a-zA-Z]{2})\<\/td\>.*?\<td\>(?<zh_Hans>.+?)\<\/td\>.*?\<td\>(?<zh_Hant>.+?)\<\/td\>.*?\<td\>.+?\<\/td\>.*?\<td\>\d+\<\/td\>.*?\<td\>(?:\d+)?\<\/td\>.*?\<\/tr\>/;
W20 provides an extensive culture support through the jQuery Globalize library. It provides the developer tools to 
internationalize a W20 application which can then be localized via fragment manifests. As AngularJS
also provides internalization support, W20 attempts to convert the active Globalize culture definition to an 
AngularJS locale, on a best-effort basis. This automatic conversion has limits, so it is recommended to stick to
the W20 functions and services for internationalization. 


# Cultures

Cultures are defined as a combination of the language and the country speaking it. Each culture is given a unique code 
that is a combination of an ISO 639 two-letter lowercase culture code for the language, and a two-letter uppercase code 
for the country or region. For example, "en-US" is the culture code for English in the United States. Only one culture 
can be active at a time in the application but you can format values in any culture supported by the application, 
without switching the active one. This module handles:
 
* Textual internationalization, 
* Date and time formatting, 
* Currency formatting, 
* Number formatting.

W20 supports about 350 cultures but can also be extended to custom-defined ones. Here is the list of out-of-the-box
supported cultures:

    af-ZA, af, am-ET, am, ar-AE, ar-BH, ar-DZ, ar-EG, ar-IQ, ar-JO, ar-KW, ar-LB, ar-LY, ar-MA, ar-OM, 
    ar-QA, ar-SA, ar-SY, ar-TN, ar-YE, ar, arn-CL, arn, as-IN, as, az-Cyrl-AZ, az-Cyrl, az-Latn-AZ, 
    az-Latn, az, ba-RU, ba, be-BY, be, bg-BG, bg, bn-BD, bn-IN, bn, bo-CN, bo, br-FR, br, 
    bs-Cyrl-BA, bs-Cyrl, bs-Latn-BA, bs-Latn, bs, ca-ES, ca, co-FR, co, cs-CZ, cs, cy-GB, cy, da-DK, 
    da, de-AT, de-CH, de-DE, de-LI, de-LU, de,  dsb-DE, dsb, dv-MV, dv, el-GR, el, en-029, en-AU, 
    en-BZ, en-CA, en-GB, en-IE, en-IN, en-JM, en-MY, en-NZ, en-PH, en-SG, en-TT, en-US, en-ZA, 
    en-ZW, es-AR, es-BO, es-CL, es-CO, es-CR, es-DO, es-EC, es-ES, es-GT, es-HN, es-MX, es-NI, 
    es-PA, es-PE, es-PR, es-PY, es-SV, es-US, es-UY, es-VE, es, et-EE, et, eu-ES, eu, fa-IR, 
    fa, fi-FI, fi, fil-PH, fil, fo-FO, fo, fr-BE, fr-CA, fr-CH, fr-FR, fr-LU, fr-MC, fr, fy-NL, 
    fy, ga-IE, ga, gd-GB, gd, gl-ES, gl, gsw-FR, gsw, gu-IN, gu, ha-Latn-NG, ha-Latn, ha, he-IL, 
    he, hi-IN, hi, hr-BA, hr-HR, hr, hsb-DE, hsb, hu-HU, hu, hy-AM, hy, id-ID, id, ig-NG, ig, 
    ii-CN, ii, is-IS, is, it-CH, it-IT, it, iu-Cans-CA, iu-Cans, iu-Latn-CA, iu-Latn, iu, 
    ja-JP, ja, ka-GE, ka, kk-KZ, kk, kl-GL, kl, km-KH, km, kn-IN, kn, ko-KR, ko, kok-IN, 
    kok, ky-KG, ky, lb-LU, lb, lo-LA, lo, lt-LT, lt, lv-LV, lv, mi-NZ, mi, mk-MK, mk, 
    ml-IN, ml, mn-Cyrl, mn-MN, mn-Mong-CN, mn-Mong, mn, moh-CA, moh, mr-IN, mr, ms-BN, 
    ms-MY, ms, mt-MT, mt, nb-NO, nb, ne-NP, ne, nl-BE, nl-NL, nl, nn-NO, nn, no, nso-ZA, 
    nso, oc-FR, oc, or-IN, or, pa-IN, pa, pl-PL, pl, prs-AF, prs, ps-AF, ps, pt-BR, pt-PT, pt, 
    qut-GT, qut, quz-BO, quz-EC, quz-PE, quz, rm-CH, rm, ro-RO, ro, ru-RU, ru, rw-RW, rw, 
    sa-IN, sa, sah-RU, sah, se-FI, se-NO, se-SE, se, si-LK, si, sk-SK, sk, sl-SI, sl, sma-NO, 
    sma-SE, sma, smj-NO, smj-SE, smj, smn-FI, smn, sms-FI, sms, sq-AL, sq, sr-Cyrl-BA, sr-Cyrl-CS, 
    sr-Cyrl-ME, sr-Cyrl-RS, sr-Cyrl, sr-Latn-BA, sr-Latn-CS, sr-Latn-ME, sr-Latn-RS, sr-Latn, sr, 
    sv-FI, sv-SE, sv, sw-KE, sw, syr-SY, syr, ta-IN, ta, te-IN, te, tg-Cyrl-TJ, tg-Cyrl, tg, 
    th-TH, th, tk-TM, tk, tn-ZA, tn, tr-TR, tr, tt-RU, tt, tzm-Latn-DZ, tzm-Latn, tzm, ug-CN, 
    ug, uk-UA, uk, ur-PK, ur, uz-Cyrl-UZ, uz-Cyrl, uz-Latn-UZ, uz-Latn, uz, vi-VN, vi, wo-SN, 
    wo, xh-ZA, xh, yo-NG, yo, zh-CHS, zh-CHT, zh-CN, zh-Hans, zh-Hant, zh-HK, zh-MO, 
    zh-SG, zh-TW, zh, zu-ZA, zu.

# Configuration

The culture module can be configured with the following attribute:

* `default` which is the culture name of the default culture. It defaults to "en".

# Fragment declaration
    
The fragment "i18n" section allows to declare culture localization bundles:
    
    "i18n" : {
        "" : [ "rest/i18n/bundle/:language" ]
        "en" : [ "i18n/en-bundle-1.json", "i18n/en-bundle-2.json", ...  ],
        "fr-FR" : [ "i18n/fr-FR-bundle-1.json", "i18n/fr-FR-bundle-1.json", ...  ]
    }
    
Bundles modules paths will be loaded as a text dependency and parsed as JSON. The empty culture code can be used to 
point to a dynamically generated bundle. In that case, two placeholders can be used in the URL:
  
* The `:language` placeholder will be replaced by the actual language code,
* The `:culture` placeholder will be replaced by the actual culture code.

Dynamic bundles will always be loaded for any language. If no keys are available for a particular language an empty
object can be returned.

# Formatting

Numbers and dates can be formatted in various ways by using formatting patterns.

## Number formatting

When formatting a number, the main purpose is to convert the number into a human readable string using the culture's 
standard grouping and decimal rules. The rules between cultures can vary a lot. For example, in some cultures, the 
grouping of numbers is done unevenly. In the "te-IN" culture (Telugu in India), groups have 3 digits and then 2 digits. 
The number 1000000 (one million) is written as "10,00,000". Some cultures do not group numbers at all. There are four 
main types of number formatting:

* **n** for number
* **d** for decimal digits
* **p** for percentage
* **c** for currency

Even within the same culture, the formatting rules can vary between these four types of numbers. For example, the expected 
number of decimal places may differ from the number format to the currency format. Each format token may also be
followed by a number. The number determines how many decimal places to display for all the format types except decimal, 
for which it means the minimum number of digits to display, zero padding it if necessary. Also note that the way negative 
numbers are represented in each culture can vary, such as what the negative sign is, and whether the negative sign 
appears before or after the number. This is especially apparent with currency formatting, where many cultures use 
parentheses instead of a negative sign. For instance in the "en-US" culture:

* 123.45 formatted with "n" will give **123.45**
* 123.45 formatted with "n0" will give **123**
* 123.45 formatted with "n1" will give **123.5**
* 123.45 formatted with "d" will give **123**
* 12 formatted with "d3" will give **012**
* 123.45 formatted with "c" will give **$123.45**
* 123.45 formatted with "c0" will give **$123**
* 123.45 formatted with "c1" will give **$123.5**
* -123.45 formatted with "c" will give **($123.45)**
* 0.12345 formatted with "p" will give **12.35 %**
* 0.12345 formatted with "p0" will give **12 %**
* 0.12345 formatted with "p4" will give **12.3450 %**
     
Parsing also accepts any of these formats.

## Date formatting

Date formatting varies wildly by culture, not just in the spelling of month and day names, and the date separator, but 
by the expected order of the various date components, whether to use a 12 or 24 hour clock, and how months and days
are abbreviated. Many cultures even include "genitive" month names, which are different from the typical names and are 
used only in certain cases. Also, each culture has a set of "standard" or "typical" formats. For example, in "en-US", 
when displaying a date in its fullest form, it looks like "Saturday, November 05, 1955". Note the non-abbreviated day 
and month name, the zero padded date, and four digit year.

<table class="table table-striped">
<tr>
<th>Format</th>
<th>Meaning</th>
<th>"en-US"</th>
</tr>
<tr>
<td>f</td>
<td>Long Date, Short Time</td>
<td>dddd, MMMM dd, yyyy h:mm tt</td>
</tr>
<tr>
<td>F</td>
<td>Long Date, Long Time</td>
<td>dddd, MMMM dd, yyyy h:mm:ss tt</td>
</tr>
<tr>
<td>t</td>
<td>Short Time</td>
<td>h:mm tt</td>
</tr>
<tr>
<td>T</td>
<td>Long Time</td>
<td>h:mm:ss tt</td>
</tr>
<tr>
<td>d</td>
<td>Short Date</td>
<td>M/d/yyyy</td>
</tr>
<tr>
<td>D</td>
<td>Long Date</td>
<td>dddd, MMMM dd, yyyy</td>
</tr>
<tr>
<td>Y</td>
<td>Month/Year</td>
<td>MMMM, yyyy</td>
</tr>
<tr>
<td>M</td>
<td>Month/Day</td>
<td>MMMM dd</td>
</tr>
</table>
In addition to these standard formats, there is the "S" format. This is a
sortable format that is identical in every culture:
"<strong>yyyy'-'MM'-'dd'T'HH':'mm':'ss</strong>".
When more specific control is needed over the formatting, you may use any
format you wish by specifying the following custom tokens:
<table class="table table-striped">
<tr>
<th>Token</th>
<th>Meaning</th>
<th>Example</th>
</tr>
<tr>
<td>d</td>
<td>Day of month (no leading zero)</td>
<td>5</td>
</tr>
<tr>
<td>dd</td>
<td>Day of month (leading zero)</td>
<td>05</td>
</tr>
<tr>
<td>ddd</td>
<td>Day name (abbreviated)</td>
<td>Sat</td>
</tr>
<tr>
<td>dddd</td>
<td>Day name (full)</td>
<td>Saturday</td>
</tr>
<tr>
<td>M</td>
<td>Month of year (no leading zero)</td>
<td>9</td>
</tr>
<tr>
<td>MM</td>
<td>Month of year (leading zero)</td>
<td>09</td>
</tr>
<tr>
<td>MMM</td>
<td>Month name (abbreviated)</td>
<td>Sep</td>
</tr>
<tr>
<td>MMMM</td>
<td>Month name (full)</td>
<td>September</td>
</tr>
<tr>
<td>yy</td>
<td>Year (two digits)</td>
<td>55</td>
</tr>
<tr>
<td>yyyy</td>
<td>Year (four digits)</td>
<td>1955</td>
</tr>
<tr>
<td>'literal'</td>
<td>Literal Text</td>
<td>'of the clock'</td>
</tr>
<tr>
<td>\'</td>
<td>Single Quote</td>
<td>'o'\''clock'</td><!-- o'clock -->
</tr>
<tr>
<td>m</td>
<td>Minutes (no leading zero)</td>
<td>9</td>
</tr>
<tr>
<td>mm</td>
<td>Minutes (leading zero)</td>
<td>09</td>
</tr>
<tr>
<td>h</td>
<td>Hours (12 hour time, no leading zero)</td>
<td>6</td>
</tr>
<tr>
<td>hh</td>
<td>Hours (12 hour time, leading zero)</td>
<td>06</td>
</tr>
<tr>
<td>H</td>
<td>Hours (24 hour time, no leading zero)</td>
<td>5 (5am) 15 (3pm)</td>
</tr>
<tr>
<td>HH</td>
<td>Hours (24 hour time, leading zero)</td>
<td>05 (5am) 15 (3pm)</td>
</tr>
<tr>
<td>s</td>
<td>Seconds (no leading zero)</td>
<td>9</td>
</tr>
<tr>
<td>ss</td>
<td>Seconds (leading zero)</td>
<td>09</td>
</tr>
<tr>
<td>f</td>
<td>Deciseconds</td>
<td>1</td>
</tr>
<tr>
<td>ff</td>
<td>Centiseconds</td>
<td>11</td>
</tr>
<tr>
<td>fff</td>
<td>Milliseconds</td>
<td>111</td>
</tr>
<tr>
<td>t</td>
<td>AM/PM indicator (first letter)</td>
<td>A or P</td>
</tr>
<tr>
<td>tt</td>
<td>AM/PM indicator (full)</td>
<td>AM or PM</td>
</tr>
<tr>
<td>z</td>
<td>Timezone offset (hours only, no leading zero)</td>
<td>-8</td>
</tr>
<tr>
<td>zz</td>
<td>Timezone offset (hours only, leading zero)</td>
<td>-08</td>
</tr>
<tr>
<td>zzz</td>
<td>Timezone offset (full hours/minutes)</td>
<td>-08:00</td>
</tr>
<tr>
<td>g or gg</td>
<td>Era name</td>
<td>A.D.</td>
</tr>
</table>

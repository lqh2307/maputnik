import { max, min } from "../Number";

/** XML opening-tag marker used by the lightweight formatter. */
const XML_OPEN_TAG_PATTERN: RegExp = /<\w/;
/** XML closing-tag marker used by the lightweight formatter. */
const XML_CLOSE_TAG_PATTERN: RegExp = /<\//;
/** XML self-closing-tag marker used by the lightweight formatter. */
const XML_SELF_CLOSING_TAG_PATTERN: RegExp = /\/>/;
/** XML comment terminator. */
const XML_COMMENT_END_PATTERN: RegExp = /-->/;
/** CDATA section terminator. */
const XML_CDATA_END_PATTERN: RegExp = /\]>/;

/**
 * Inserts line breaks between XML tags with a lightweight, regex-based
 * formatter. It preserves adjacent opening/closing tags on one line and has
 * special handling for comments, CDATA, DOCTYPE declarations, and namespaces.
 *
 * This is not a general XML parser. Nested tags are indented with `indent`,
 * which defaults to a tab character.
 *
 * @param str XML string to format.
 * @param indent String to add for every nesting level.
 * @returns The formatted XML, or an empty string for an empty input.
 */
export function formatXML(str: string, indent?: string): string {
  if (!str) {
    return "";
  }

  // Normalize whitespace between tags before adding newline prefixes.
  const processedXml: string = str.replace(/>\s+</g, "><");

  // Build indentation prefixes for each nesting depth.
  const indentation: string = indent ?? "\t";
  const shift: string[] = new Array<string>(20);
  shift[0] = "\n";
  for (let index = 1; index < shift.length; index++) {
    shift[index] = shift[index - 1] + indentation;
  }
  const maxShiftIndex: number = shift.length - 1;

  /**
   * Returns the newline prefix for a nesting depth, capped at the deepest
   * prefix available in `shift`.
   *
   * @param depth Current nesting depth.
   * @returns The corresponding newline prefix.
   */
  function indentAt(depth: number): string {
    return shift[min(depth, maxShiftIndex)];
  }

  /**
   * Extracts the name from an opening or closing XML tag token.
   *
   * @param tagString Raw tag token beginning with `<`.
   * @returns The tag name without a leading slash, or an empty string when the
   * token does not begin with a supported tag name.
   */
  function getTagName(tagString: string): string {
    const match: RegExpExecArray = /^<(\/?[\w:\-\.,]+)/.exec(tagString);

    return match ? match[1].replace("/", "") : "";
  }

  // Split XML into parts for formatting
  const parts: string[] = processedXml
    .replace(/</g, "~::~<")
    .replace(/\s*xmlns\:/g, "~::~xmlns:")
    .replace(/\s*xmlns\=/g, "~::~xmlns=")
    .split("~::~");

  let inComment: boolean;
  let deep: number = 0;
  const resultParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part: string = parts[i];
    if (!part) {
      continue;
    }

    if (part.search(/<!/) > -1) {
      // Start comment, CDATA or DOCTYPE
      resultParts.push(indentAt(deep) + part);

      inComment = true;

      // End comment, CDATA or DOCTYPE
      if (
        part.search(XML_COMMENT_END_PATTERN) > -1 ||
        part.search(XML_CDATA_END_PATTERN) > -1 ||
        part.search(/!DOCTYPE/) > -1
      ) {
        inComment = false;
      }
    } else if (
      part.search(XML_COMMENT_END_PATTERN) > -1 ||
      part.search(XML_CDATA_END_PATTERN) > -1
    ) {
      // End comment or CDATA
      resultParts.push(part);

      inComment = false;
    } else if (
      /^<\w/.exec(parts[i - 1]) &&
      /^<\/\w/.exec(part) &&
      getTagName(parts[i - 1]) === getTagName(part)
    ) {
      // Closing tag immediately after open tag: <tag></tag>
      resultParts.push(part);

      if (!inComment) {
        deep = max(deep - 1, 0);
      }
    } else if (
      part.search(XML_OPEN_TAG_PATTERN) > -1 &&
      part.search(XML_CLOSE_TAG_PATTERN) === -1 &&
      part.search(XML_SELF_CLOSING_TAG_PATTERN) === -1
    ) {
      // Opening tag: <tag>
      if (inComment) {
        resultParts.push(part);
      } else {
        resultParts.push(indentAt(deep) + part);

        deep++;
      }
    } else if (
      part.search(XML_OPEN_TAG_PATTERN) > -1 &&
      part.search(XML_CLOSE_TAG_PATTERN) > -1
    ) {
      // Open and close on same line: <tag></tag>
      resultParts.push(inComment ? part : indentAt(deep) + part);
    } else if (part.search(XML_CLOSE_TAG_PATTERN) > -1) {
      // Closing tag: </tag>
      deep = max(deep - 1, 0);

      resultParts.push(inComment ? part : indentAt(deep) + part);
    } else if (part.search(XML_SELF_CLOSING_TAG_PATTERN) > -1) {
      // Self-closing tag: <tag/>
      resultParts.push(inComment ? part : indentAt(deep) + part);
    } else if (part.search(/<\?/) > -1) {
      // XML declaration: <?xml ... ?>
      resultParts.push(indentAt(deep) + part);
    } else if (part.search(/xmlns\:/) > -1 || part.search(/xmlns\=/) > -1) {
      // Namespace attributes
      resultParts.push(indentAt(deep) + part);
    } else {
      resultParts.push(part);
    }
  }

  return resultParts.join("").trim();
}

/**
 * Removes whitespace between adjacent XML tags and, optionally, XML comments.
 * This also removes whitespace-only text nodes, but leaves non-whitespace text
 * and attribute values unchanged.
 *
 * @param str XML string to compact.
 * @param removeComments Whether to remove `<!-- ... -->` sections before
 * compacting.
 * @returns The compacted XML, or an empty string for an empty input.
 */
export function minifyXML(str: string, removeComments?: boolean): string {
  if (!str) {
    return "";
  }

  let result: string = str.trim();

  if (removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }

  return result.replace(/>\s{0,}</g, "><");
}

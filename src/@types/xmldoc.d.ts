// Can you tell I wanna shoot myself?
declare module "xmldoc" {
	class XmlDocument extends XmlElement {
		constructor(xml:String|Buffer);
		doctype: string;
	}

	/**
	 * *All methods with child in the name operate only on direct children; they do not do a deep/recursive search.*
	 */
	class XmlElement {
		type: "element";

		/**
		 * The node name, like `"tat"` for `<tat>`. XML "namespaces" are ignored by the underlying sax-js parser, so you'll simply get `"office:body"` for `<office:body>`.
		 */
		name: string;

		/**
		 * An object dict containing attribute properties, like `bookNode.attr.title` for `<book title="...">`.
		 */
		attr: Record<string, string>;

		/**
		 * The string "value" of the node, if any, like `"world"` for `<hello>world</hello>`.
		 */
		val: string;

		/**
		 * An array of `XmlElement` children of the node.
		 */
		children: XmlElement[];

		/**
		 * pretty much what it sounds like; `null` if no children
		 */
		firstChild: XmlElement | null;
		/**
		 * pretty much what it sounds like; `null` if no children
		 */
		lastChild: XmlElement | null;

		/**
		 * The element's line position in the original XML string.
		 */
		line: number;

		/**
		 * The element's column position in the original XML string.
		 */
		column: number;

		/**
		 * The element's position in the original XML string.
		 */
		position: number;

		/**
		 * The element's position in the original XML string.
		 */
		startTagPosition: number;

		/**
		 * Similar to underscore's `each` method, it will call `func(child, index, array)` for each child of the given node.
		 */
		eachChild(iterator:(child:XmlElement, index:number, array:XmlElement[]) => unknown): void;

		/**
		 * Pass it the name of a child node and it will search for and return the first one found, or `undefined`.
		 */
		childNamed(name:string): XmlElement;

		/**
		 * Like `childNamed` but returns all matching children in an array, or `[]`.
		 */
		childrenNamed(name:string): XmlElement[];

		/**
		 * Searches for the first child with the given attribute value. You can omit value to just find the first node with the given attribute defined at all.
		 */
		childWithAttribute(name:string, value?:string): XmlElement;

		/**
		 * Searches for a specific "path" using dot notation. Example:
		 * 
		 * ```js
		 * <book>
		 *  <author>
		 *   <name isProper="true">George R. R. Martin</name>
		 *   ...
		 *  </author>
		 *  ...
		 * </book>
		 * ```
		 * If you just want the `<name>` node and you have the `XmlElement` for the `<book>` node, you can say:
		 * ```js
		 * var nameNode = bookNode.descendantWithPath("author.name"); // return <name> node
		 * ```
		 */
		descendantWithPath(path:string): XmlElement;

		/**
		 * Just like `descendantWithPath`, but goes deeper and extracts the `val` of the node. Example:
		 * 
		 * ```js
		 * var authorName = bookNode.valueWithPath("author.name"); // return "George R. R. Martin"
		 * ```
		 * You can also use the `@` character to request the value of a particular *attribute* instead:
		 * 
		 * ```js
		 * var authorIsProper = bookNode.valueWithPath("author.name@isProper"); // return "true"
		 * ```
		 * This is not [XPath](http://en.wikipedia.org/wiki/XPath)! It's just a thing I made up, OK?
		 */
		valueWithPath(path:string): string;

		toString(options?:object): string;
	}

	class XmlTextNode {
		type: "text";
		text: string;
		toString(): string;
		toStringWithIndent(): string;
	}
	class XmlCDataNode {
		type: "cdata";
		cdata: string;
		toString(): string;
		toStringWithIndent(): string;
	}
	class XmlCommentNode {
		type: "comment";
		comment: string;
		toString(): string;
		toStringWithIndent(): string;
	}
}

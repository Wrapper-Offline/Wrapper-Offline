// thank god for the readme
declare module "node-zip" {
    import { Readable, Writable } from "stream";

    /**
     * Represents a PKZIP file.
     */
    class ZipFile {
        /**
         * Adds a zip file entry.
         * @param name File name within the zip.
         * @param content A buffer containing the file contents.
         * @param options ZLib options.
         */
        add(name:string, content:Buffer, options?:object): void;

        /**
         * Returns a file entry iterator, which yields `[name, entry]`.
         */
        entries(): {[key:string]: ZipEntry};

        /**
         * Returns a file entry iterator, which yields `entry`.
         */
        iterator(): Iterable<ZipEntry>;

        /**
         * Returns a `Promise`, which resolves a `Buffer` when all file entries are compressed and joined together.
         */
        zip(): Promise<Buffer>;
    }

    /**
     * Represents an entry of a PKZIP file.
     */
    class ZipEntry {
        /**
         * The file name of this zip file entry. Note that non-ascii file names is treated as `UTF-8` encoded.
         */
        name:string;

        /**
         * The uncompressed size of the zipped file, in bytes.
         */
        originalSize:number;

        /**
         * Whether a zip entry is directory.
         */
        isDir:Boolean;

        /**
         * The crc32 checksum of the original content.
         */
        crc32:number;

        /**
         * Returns a `Promise` that resolves a `Buffer` when file entry content is read and inflated.
         * ohhhh inflation yeeeaaaaah
         */
        inflate(): Promise<Buffer>;

        /**
         * Returns a `stream.Readable` that contains the inflated content.
         */
        toReadStream(): Readable;

        /**
         * Writes the compressed content to a writable object.
         * - If the ZipFile that contains this entry is created from original content, the content will be compressed.
         * - Otherwise, the original compressed content will be written
         * 
         * Note that even `compressed = false` is given when adding a file entry, the file entry content is still compressed, with options: `level = 0` which means no compression is performed, but zlib header and trailer will be appended.
         * @param writable Writable stream
         */
        pipe(writable:Writable): void;
    }

    /**
     * Creates a new `ZipFile`.
     * @param entries can be a map of file name and buffer that would be added to the zipFile created.
     */
    function create(entries?:object): ZipFile;

    /**
     * Creates a `ZipFile` from an existing file.
     * @param file a filename, or a fd, or a buffer
     */
    function unzip(file:string|number|Buffer): ZipFile;
}

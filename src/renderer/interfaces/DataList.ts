/** required values in a list entry */
export type DataListEntry = {
	id: string
};

export type EntryKey<T extends DataListEntry> = keyof T | "index";

/** object containing column widths indexed by the entry key */
export type Columns<T extends DataListEntry> = Partial<Record<EntryKey<T>, number>>;

export enum Flow {
	Grid,
	List
};

export interface Folder {
	id: string,
	name: string,
	color: number,
	size: number,
	folder?: string
};

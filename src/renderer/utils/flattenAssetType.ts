import type { Asset } from "../interfaces/Asset";

export function flattenAssetType(asset:Asset): string {
	switch (asset.type) {
		case "bg": {
			return asset.type;
		}
		case "sound": {
			return asset.subtype;
		}
		case "prop": {
			if (asset.subtype == "video") {
				return asset.subtype;
			}
			return asset.ptype;
		}
	}
};

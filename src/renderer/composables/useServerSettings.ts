import { apiServer } from "../utils/AppInit";
import { onUnmounted, type Ref, ref, watch } from "vue";

interface SettingsObj {
	enableMenuBar: boolean
	pollyService: string
	saveLogFiles: boolean
	truncatedThemeList: boolean
}

class ServerSettings {
	private static _instance:ServerSettings;
	private settings:SettingsObj | null = null;
	private isLoading:boolean = false;
	private unloadTimer:ReturnType<typeof setTimeout> | null = null;
	private dependents:number = 0;

	static get instance() {
		if (!this._instance) {
			this._instance = new ServerSettings();
		}
		return this._instance;
	}

	private async loadSettings(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			if (this.isLoading) {
				let timer = setInterval(() => {
					if (this.isLoading == false) {
						clearInterval(timer);
						resolve();
					}
				}, 200);
				return;
			}
			this.isLoading = true;
			const res = await fetch(`${apiServer}/api/settings/list`);
			this.settings = await res.json();
			this.isLoading = false;
			resolve();
		});
	}

	set<S extends keyof SettingsObj>(id:S, value:SettingsObj[S]) {
		if (this.settings === null) {
			return;
		}
		if (this.settings[id] == value) {
			return;
		}
		this.settings[id] = value;
		const form = new FormData();
		form.append("setting", id);
		form.append("value", value.toString());
		fetch(`${apiServer}/api/settings/update`, {
			method: "POST",
			body: form
		});
	}

	/**
	 * returns a setting value from id
	 * @param id setting id
	 * @returns setting value
	 */
	get<S extends keyof SettingsObj>(id:S): Ref<SettingsObj[S]> {
		this.dependents++;
		if (this.unloadTimer) {
			clearTimeout(this.unloadTimer);
			this.unloadTimer = null;
		}
		const pendingRef = ref();
		if (this.settings === null) {
			this.loadSettings().then(() => {
				if (this.settings === null) {
					throw new Error("Failed to load server settings");
				}
				pendingRef.value = this.settings[id];
			});
		} else {
			pendingRef.value = this.settings[id];
		}
		return pendingRef;
	}

	done(): void {
		this.dependents--;
		if (this.dependents == 0) {
			this.unloadTimer = setTimeout(() => {
				this.settings = null;
			}, 5000);
		}
	}
}

export default function useServerSetting<S extends keyof SettingsObj>(id:S): Ref<SettingsObj[S]> {
	const settingRef = ServerSettings.instance.get(id);
	watch(settingRef, (val) => ServerSettings.instance.set(id, val));
	onUnmounted(() => ServerSettings.instance.done());
	return settingRef;
};

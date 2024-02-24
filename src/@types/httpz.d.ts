import { Eta } from "eta";

declare module "@octanuary/httpz" {
	interface Request {
		body: {[key: string]: any};
		files: {[key: string]: any};
	}
	interface Response {
		render(filename:string, data:Object, config?:{filepath:string}): Promise<void>;
	}
}

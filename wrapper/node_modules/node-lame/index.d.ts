import { EventEmitter } from "events";

declare namespace Options {
    type sfreq = 8 | 11.025 | 12 | 16 | 22.05 | 24 | 32 | 44.1 | 48;
    type bitwidth = 8 | 16 | 24 | 32;
    type mode = "s" | "j" | "f" | "d" | "m" | "l" | "r";
    type freeformat = "FreeAmp" | "in_mpg123" | "l3dec" | "LAME" | "MAD";
    type preset = "medium" | "standard" | "extreme" | "insane";
    type noasm = "mmx" | "3dnow" | "sse";
    type quality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    type bitrate =
        | 8
        | 16
        | 24
        | 32
        | 40
        | 48
        | 56
        | 64
        | 80
        | 96
        | 112
        | 128
        | 144
        | 160
        | 192
        | 224
        | 256
        | 320;
    type emp = "n" | 5 | "c";
    type resample = 8 | 11.025 | 12 | 16 | 22.05 | 24 | 32 | 44.1 | 48;

    interface meta {
        title?: string;
        artist?: string;
        album?: string;
        year?: string;
        comment?: string;
        track?: string;
        genre?: string;

        "add-id3v2"?: boolean;
        "id3v1-only"?: boolean;
        "id3v2-only"?: boolean;
        "id3v2-latin1"?: boolean;
        "id3v2-utf16"?: boolean;
        "space-id3v1"?: boolean;
        "pad-id3v2-size"?: number;
        "genre-list"?: string;
        "ignore-tag-errors"?: boolean;
    }
}

declare interface Options {
    output: string | "buffer";
    raw?: boolean;
    "swap-bytes"?: boolean;
    sfreq?: Options.sfreq;
    bitwidth?: Options.bitwidth;
    signed?: boolean;
    unsigned?: boolean;
    "little-endian"?: boolean;
    "big-endian"?: boolean;
    mp2Input?: boolean;
    mp3Input?: boolean;
    mode?: Options.mode;
    "to-mono"?: boolean;
    "channel-different-block-sizes"?: boolean;
    freeformat?: Options.freeformat;
    "disable-info-tag"?: boolean;
    comp?: number;
    scale?: number;
    "scale-l"?: number;
    "scale-r"?: number;
    "replaygain-fast"?: boolean;
    "replaygain-accurate"?: boolean;
    "no-replaygain"?: boolean;
    "clip-detect"?: boolean;
    preset?: Options.preset;
    noasm?: Options.noasm;
    quality?: Options.quality;
    bitrate?: Options.bitrate;
    "force-bitrate"?: boolean;
    cbr?: boolean;
    abr?: number;
    vbr?: boolean;
    "vbr-quality"?: number;
    "ignore-noise-in-sfb21"?: boolean;
    emp?: Options.emp;
    "mark-as-copyrighted"?: boolean;
    "mark-as-copy"?: boolean;
    "crc-error-protection"?: boolean;
    nores?: boolean;
    "strictly-enforce-ISO"?: boolean;
    lowpass?: number;
    "lowpass-width"?: number;
    highpass?: number;
    "highpass-width"?: number;
    resample?: Options.resample;
    meta?: Options.meta;
}

declare interface LameStatus {
    started: boolean;
    finished: boolean;
    progress: number;
    eta: string;
}

declare class Lame {
    constructor(options: Options);

    public setFile(path: string): Lame;
    public setBuffer(file: Buffer): Lame;
    public getFile(): string;
    public getBuffer(): Buffer;
    public getEmitter(): EventEmitter;
    public getStatus(): LameStatus;

    public encode(): Promise<boolean>;
    public decode(): Promise<boolean>;
    private progress(type: "encode" | "decode"): Promise<boolean>;
    private execProgress(
        inputFilePath: string,
        args: string[],
        type: "encode" | "decode"
    );
    private tempFilePathGenerator(type: "raw" | "encoded"): string;
    private removeTempFilesOnError();
}

export { Lame };

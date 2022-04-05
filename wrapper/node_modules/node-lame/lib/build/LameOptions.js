"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LameOptions = void 0;
/**
 * All options of node-lame; build argument array for binary
 *
 * @class LameOptions
 */
class LameOptions {
    /**
     * Validate all options and build argument array for binary
     * @param {Object} options
     */
    constructor(options) {
        this.args = [];
        // Output is required
        if (options["output"] == undefined) {
            throw new Error("lame: Invalid option: 'output' is required");
        }
        // Save options as arguments
        for (const key in options) {
            const value = options[key];
            let arg;
            switch (key) {
                case "output":
                    arg = this.output(value);
                    break;
                case "raw":
                    arg = this.raw(value);
                    break;
                case "swap-bytes":
                    arg = this.swapBytes(value);
                    break;
                case "sfreq":
                    arg = this.sfreq(value);
                    break;
                case "bitwidth":
                    arg = this.bitwidth(value);
                    break;
                case "signed":
                    arg = this.signed(value);
                    break;
                case "unsigned":
                    arg = this.unsigned(value);
                    break;
                case "little-endian":
                    arg = this.littleEndian(value);
                    break;
                case "big-endian":
                    arg = this.bigEndian(value);
                    break;
                case "mp2Input":
                    arg = this.mp2Input(value);
                    break;
                case "mp3Input":
                    arg = this.mp3Input(value);
                    break;
                case "mode":
                    arg = this.mode(value);
                    break;
                case "to-mono":
                    arg = this.toMono(value);
                    break;
                case "channel-different-block-sizes":
                    arg = this.channelDifferentBlockSize(value);
                    break;
                case "freeformat":
                    arg = this.freeformat(value);
                    break;
                case "disable-info-tag":
                    arg = this.disableInfoTag(value);
                    break;
                case "comp":
                    arg = this.comp(value);
                    break;
                case "scale":
                    arg = this.scale(value);
                    break;
                case "scale-l":
                    arg = this.scaleL(value);
                    break;
                case "scale-r":
                    arg = this.scaleR(value);
                    break;
                case "replaygain-fast":
                    arg = this.replaygainFast(value);
                    break;
                case "replaygain-accurate":
                    arg = this.replaygainAccurate(value);
                    break;
                case "no-replaygain":
                    arg = this.noreplaygain(value);
                    break;
                case "clip-detect":
                    arg = this.clipDetect(value);
                    break;
                case "preset":
                    arg = this.preset(value);
                    break;
                case "noasm":
                    arg = this.noasm(value);
                    break;
                case "quality":
                    arg = this.quality(value);
                    break;
                case "bitrate":
                    arg = this.bitrate(value);
                    break;
                case "force-bitrate":
                    arg = this.forceBitrate(value);
                    break;
                case "cbr":
                    arg = this.cbr(value);
                    break;
                case "abr":
                    arg = this.abr(value);
                    break;
                case "vbr":
                    arg = this.vbr(value);
                    break;
                case "vbr-quality":
                    arg = this.vbrQuality(value);
                    break;
                case "ignore-noise-in-sfb21":
                    arg = this.ignoreNoiseInSfb21(value);
                    break;
                case "emp":
                    arg = this.emp(value);
                    break;
                case "mark-as-copyrighted":
                    arg = this.markAsCopyrighted(value);
                    break;
                case "mark-as-copy":
                    arg = this.markAsCopy(value);
                    break;
                case "crc-error-protection":
                    arg = this.crcErrorProtection(value);
                    break;
                case "nores":
                    arg = this.nores(value);
                    break;
                case "strictly-enforce-ISO":
                    arg = this.strictlyEnforceIso(value);
                    break;
                case "lowpass":
                    arg = this.lowpass(value);
                    break;
                case "lowpass-width":
                    arg = this.lowpassWidth(value);
                    break;
                case "highpass":
                    arg = this.highpass(value);
                    break;
                case "highpass-width":
                    arg = this.highpassWidth(value);
                    break;
                case "resample":
                    arg = this.resample(value);
                    break;
                case "meta":
                    arg = this.meta(value);
                    break;
                default:
                    throw new Error("Unknown parameter " + key);
            }
            if (arg != undefined) {
                for (const i in arg) {
                    this.args.push(arg[i]);
                }
            }
        }
    }
    /**
     * Get all arguments for binary
     */
    getArguments() {
        return this.args;
    }
    output(value) {
        return undefined; // Handled in Lame class, because of fixed position (2nd parameter)
    }
    raw(value) {
        if (value == true) {
            return [`-r`];
        }
        else {
            return undefined;
        }
    }
    swapBytes(value) {
        if (value == true) {
            return [`-x`];
        }
        else {
            return undefined;
        }
    }
    sfreq(value) {
        if (value == 8 ||
            value == 11.025 ||
            value == 12 ||
            value == 16 ||
            value == 22.05 ||
            value == 24 ||
            value == 32 ||
            value == 44.1 ||
            value == 48) {
            return [`-s`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'sfreq' is not in range of 8, 11.025, 12, 16, 22.05, 24, 32, 44.1 or 48.");
        }
    }
    bitwidth(value) {
        if (value == 8 || value == 16 || value == 24 || value == 32) {
            return [`--bitwidth`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'sfreq' is not in range of 8, 16, 24 or 32.");
        }
    }
    signed(value) {
        if (value == true) {
            return [`--signed`];
        }
        else {
            return undefined;
        }
    }
    unsigned(value) {
        if (value == true) {
            return [`--unsigned`];
        }
        else {
            return undefined;
        }
    }
    littleEndian(value) {
        if (value == true) {
            return [`--little-endian`];
        }
        else {
            return undefined;
        }
    }
    bigEndian(value) {
        if (value == true) {
            return [`--big-endian`];
        }
        else {
            return undefined;
        }
    }
    mp2Input(value) {
        if (value == true) {
            return [`--mp2input`];
        }
        else {
            return undefined;
        }
    }
    mp3Input(value) {
        if (value == true) {
            return [`--mp3input`];
        }
        else {
            return undefined;
        }
    }
    mode(value) {
        if (value == "s" ||
            value == "j" ||
            value == "f" ||
            value == "d" ||
            value == "m" ||
            value == "l" ||
            value == "r") {
            return [`-m`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'mode' is not in range of 's', 'j', 'f', 'd', 'm', 'l' or 'r'.");
        }
    }
    toMono(value) {
        if (value == true) {
            return [`-a`];
        }
        else {
            return undefined;
        }
    }
    channelDifferentBlockSize(value) {
        if (value == true) {
            return [`-d`];
        }
        else {
            return undefined;
        }
    }
    freeformat(value) {
        if (value == "FreeAmp" ||
            value == "in_mpg123" ||
            value == "l3dec" ||
            value == "LAME" ||
            value == "MAD") {
            return [`--freeformat`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'mode' is not in range of 'FreeAmp', 'in_mpg123', 'l3dec', 'LAME', 'MAD'.");
        }
    }
    disableInfoTag(value) {
        if (value == true) {
            return [`-t`];
        }
        else {
            return undefined;
        }
    }
    comp(value) {
        return [`--comp`, value];
    }
    scale(value) {
        return [`--scale`, value];
    }
    scaleL(value) {
        return [`--scale-l`, value];
    }
    scaleR(value) {
        return [`--scale-r`, value];
    }
    replaygainFast(value) {
        if (value == true) {
            return [`--replaygain-fast`];
        }
        else {
            return undefined;
        }
    }
    replaygainAccurate(value) {
        if (value == true) {
            return [`--replaygain-accurate`];
        }
        else {
            return undefined;
        }
    }
    noreplaygain(value) {
        if (value == true) {
            return [`--noreplaygain`];
        }
        else {
            return undefined;
        }
    }
    clipDetect(value) {
        if (value == true) {
            return [`--clipdetect`];
        }
        else {
            return undefined;
        }
    }
    preset(value) {
        if (value == "medium" ||
            value == "standard" ||
            value == "extreme" ||
            value == "insane") {
            return [`--preset`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'mode' is not in range of 'medium', 'standard', 'extreme' or 'insane'.");
        }
    }
    noasm(value) {
        if (value == "mmx" || value == "3dnow" || value == "sse") {
            return [`--noasm`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'noasm' is not in range of 'mmx', '3dnow' or 'sse'.");
        }
    }
    quality(value) {
        if (value >= 0 && value <= 9) {
            return [`-q`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'quality' is not in range of 0 to 9.");
        }
    }
    bitrate(value) {
        if (value == 8 ||
            value == 16 ||
            value == 24 ||
            value == 32 ||
            value == 40 ||
            value == 48 ||
            value == 56 ||
            value == 64 ||
            value == 80 ||
            value == 96 ||
            value == 112 ||
            value == 128 ||
            value == 144 ||
            value == 160 ||
            value == 192 ||
            value == 224 ||
            value == 256 ||
            value == 320) {
            return [`-b`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'bitrate' is not in range of 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256 or 320.");
        }
    }
    forceBitrate(value) {
        if (value == true) {
            return [`-F`];
        }
        else {
            return undefined;
        }
    }
    cbr(value) {
        if (value == true) {
            return [`--cbr`];
        }
        else {
            return undefined;
        }
    }
    abr(value) {
        if (value >= 8 && value <= 310) {
            return [`--abr`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'abr' is not in range of 8 to 310.");
        }
    }
    vbr(value) {
        if (value == true) {
            return [`-v`];
        }
        else {
            return undefined;
        }
    }
    vbrQuality(value) {
        if (value >= 0 && value <= 9) {
            return [`-V`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'vbrQuality' is not in range of 0 to 9.");
        }
    }
    ignoreNoiseInSfb21(value) {
        if (value == true) {
            return [`-Y`];
        }
        else {
            return undefined;
        }
    }
    emp(value) {
        if (value == "n" || value == 5 || value == "c") {
            return [`-e`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'emp' is not in range of 'n', 5 or 'c'.");
        }
    }
    markAsCopyrighted(value) {
        if (value == true) {
            return [`-c`];
        }
        else {
            return undefined;
        }
    }
    markAsCopy(value) {
        if (value == true) {
            return [`-o`];
        }
        else {
            return undefined;
        }
    }
    crcErrorProtection(value) {
        if (value == true) {
            return [`-p`];
        }
        else {
            return undefined;
        }
    }
    nores(value) {
        if (value == true) {
            return [`--nores`];
        }
        else {
            return undefined;
        }
    }
    strictlyEnforceIso(value) {
        if (value == true) {
            return [`--strictly-enforce-ISO`];
        }
        else {
            return undefined;
        }
    }
    lowpass(value) {
        return [`--lowpass`, value];
    }
    lowpassWidth(value) {
        return [`--lowpass-width`, value];
    }
    highpass(value) {
        return [`--highpass`, value];
    }
    highpassWidth(value) {
        return [`--highpass-width`, value];
    }
    resample(value) {
        if (value == 8 ||
            value == 11.025 ||
            value == 12 ||
            value == 16 ||
            value == 22.05 ||
            value == 24 ||
            value == 32 ||
            value == 44.1 ||
            value == 48) {
            return [`--resample`, value];
        }
        else {
            throw new Error("lame: Invalid option: 'resample' is not in range of 8, 11.025, 12, 16, 22.05, 24, 32, 44.1 or 48.");
        }
    }
    meta(metaObj) {
        for (const key in metaObj) {
            const value = metaObj[key];
            if (key == "title" ||
                key == "artist" ||
                key == "album" ||
                key == "year" ||
                key == "comment" ||
                key == "track" ||
                key == "genre" ||
                key == "artwork" ||
                key == "genre-list" ||
                key == "pad-id3v2-size") {
                let arg0;
                if (key == "title") {
                    arg0 = `--tt`;
                }
                else if (key == "artist") {
                    arg0 = `--ta`;
                }
                else if (key == "album") {
                    arg0 = `--tl`;
                }
                else if (key == "year") {
                    arg0 = `--ty`;
                }
                else if (key == "comment") {
                    arg0 = `--tc`;
                }
                else if (key == "track") {
                    arg0 = `--tn`;
                }
                else if (key == "genre") {
                    arg0 = `--tg`;
                }
                else if (key == "artwork") {
                    arg0 = `--ti`;
                }
                else if (key == "genre-list") {
                    arg0 = `--genre-list`;
                }
                else if (key == "pad-id3v2-size") {
                    arg0 = `--pad-id3v2-size`;
                }
                else {
                    throw new Error(`lame: Invalid option: 'meta' unknown property '${key}'`);
                }
                const arg1 = `${value}`;
                this.args.push(arg0);
                this.args.push(arg1);
            }
            else if (key == "add-id3v2" ||
                key == "id3v1-only" ||
                key == "id3v2-only" ||
                key == "id3v2-latin1" ||
                key == "id3v2-utf16" ||
                key == "space-id3v1" ||
                key == "pad-id3v2" ||
                key == "ignore-tag-errors") {
                this.args.push(`--${key}`);
            }
            else {
                throw new Error(`lame: Invalid option: 'meta' unknown property '${key}'`);
            }
        }
        return undefined;
    }
}
exports.LameOptions = LameOptions;
//# sourceMappingURL=LameOptions.js.map
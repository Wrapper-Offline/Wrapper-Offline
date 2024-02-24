declare module "mp3-duration" {
    function mp3Duration(
        filePathOrBuffer:string | Buffer,
        callback?:(error:Error, duration:number) => any
    ) : Promise<number>;
    function mp3Duration(
        filePathOrBuffer:string | Buffer,
        cbrEstimate?:boolean,
        callback?:(error:Error, duration:number) => any
    ) : Promise<number>;

    export default mp3Duration;
}

export const batchAndRun = async (func: Function, batchSize: number, totalNo:number) => { 
    let start = 0;
    let end = batchSize;

    while(start < totalNo) {
        await func(start, end);
        start = end;
        if(end + batchSize > totalNo) {
            end = totalNo;
        } else {
            end = end + batchSize;
        }
    }
}
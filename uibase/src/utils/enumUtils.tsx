export function getStringValuesFromEnum<T>(myEnum: T): string[] {
    return Object.keys(myEnum).map((k:any)=>{
        return (myEnum as any)[k]
    });
}
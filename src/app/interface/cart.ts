export interface Cart{
    id: number;
    name: string;
    price: number;
    quantity: number;
    specialInfo: string;
    pictures: any[]
    favorite: boolean
    owner: any
}
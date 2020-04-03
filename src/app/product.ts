import { Departament } from './departament';

export interface Product {
    name: string;
    departments: Departament[] | string[];
    stock: number;
    price: number;
    _id ?: string;
}

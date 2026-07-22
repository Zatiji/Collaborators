export interface List {
  id: string;
  name: string;
  createdAt: number;
}

export interface Entry {
  id: string;
  listId: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

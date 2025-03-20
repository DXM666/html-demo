interface Point {
    x: number;
    y: number;
}

type Rect = { [p in keyof Point]: Point[p] };

const a: Rect = {
    x: 1,
    y: 2,
};

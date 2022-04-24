import { schemeTableau10, schemePaired, schemeCategory10, schemeAccent, schemeDark2, schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3 } from 'd3';

export enum ColorSchemas {
    schemeCategory10 = 'schemeCategory10',
    schemeAccent = 'schemeAccent',
    schemeDark2 = 'schemeDark2',
    schemePaired = 'schemePaired',
    schemePastel1 = 'schemePastel1',
    schemePastel2 = 'schemePastel2',
    schemeSet1 = 'schemeSet1',
    schemeSet2 = 'schemeSet2',
    schemeSet3 = 'schemeSet3',
    schemeTableau10 = 'schemeTableau10'

}

export const ColorSchemasMap = {
    [ColorSchemas.schemeCategory10]: schemeCategory10,
    [ColorSchemas.schemeAccent]: schemeAccent,
    [ColorSchemas.schemeDark2]: schemeDark2,
    [ColorSchemas.schemePaired]: schemePaired,
    [ColorSchemas.schemePastel1]: schemePastel1,
    [ColorSchemas.schemePastel2]: schemePastel2,
    [ColorSchemas.schemeSet1]: schemeSet1,
    [ColorSchemas.schemeSet2]: schemeSet2,
    [ColorSchemas.schemeSet3]: schemeSet3,
    [ColorSchemas.schemeTableau10]: schemeTableau10
}


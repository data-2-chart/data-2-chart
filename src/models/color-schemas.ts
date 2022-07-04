import { schemeTableau10, schemePaired, schemeCategory10, schemeAccent, schemeDark2, schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3 } from 'd3';
import { ColorSchema } from '@data-2-chart/data-2-chart-common-ts';

export const ColorSchemasMap = {
    [ColorSchema.SchemeCategory10]: schemeCategory10,
    [ColorSchema.SchemeAccent]: schemeAccent,
    [ColorSchema.SchemeDark2]: schemeDark2,
    [ColorSchema.SchemePaired]: schemePaired,
    [ColorSchema.SchemePastel1]: schemePastel1,
    [ColorSchema.SchemePastel2]: schemePastel2,
    [ColorSchema.SchemeSet1]: schemeSet1,
    [ColorSchema.SchemeSet2]: schemeSet2,
    [ColorSchema.SchemeSet3]: schemeSet3,
    [ColorSchema.SchemeTableau10]: schemeTableau10
}


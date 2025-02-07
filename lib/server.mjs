import * as fs from 'fs/promises';
import * as path from 'path';
import express from 'express';
import { logger } from './logger.mjs';
import { generatePage } from './generatePage.mjs';

process.env['PORT'] = process.env['PORT'] || '8888';

const app = express();

app.get('/', async (req, res) => {
    const html = await fs.readFile(path.resolve(import.meta.dirname, '..', 'public', 'index.html'), 'utf8');

    res.send(html);
});

app.listen(process.env['PORT'], () => {
    logger.info(`link app listening on port ${process.env['PORT']}`);
});

const html = await generatePage();
await fs.writeFile(path.resolve(import.meta.dirname, '..', 'public', 'index.html'), html);

// setInterval(async () => {
//     const html = await generatePage();
//     await fs.writeFile(path.resolve(import.meta.dirname, '..', 'public', 'index.html'), html);
// }, 1000 * 60 * 10);

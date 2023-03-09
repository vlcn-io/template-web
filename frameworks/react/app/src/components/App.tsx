import React from 'react';
import styled from 'styled-components';
import { useTable, useBlockLayout } from 'react-table';
import { FixedSizeList } from 'react-window';
import scrollbarWidth from './scrollbarWidth.js';
import { CtxAsync, pick, useRangeQuery } from '@vlcn.io/react';

import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style, data }: { index: number; style: any; data: string[] }) => (
  // usePointQuery to get a single row
  <div style={style}>Row {index}</div>
);

function Table({ ctx, filter }: { ctx: CtxAsync; filter: string }) {
  // filter query should debounce...
  // and not run if a filter query is already running

  const filteredRows = useRangeQuery<{ id: string }, string[]>(
    ctx,
    'SELECT id FROM issue_fts WHERE issue_fts MATCH ? ORDER BY rank',
    [filter ? filter : '""'],
    pick
  ).data;
  const allRows = useRangeQuery<{ id: string }, string[]>(
    ctx,
    'SELECT id FROM issue ORDER BY updated_at DESC',
    [],
    pick
  ).data;

  const displayedRows = filter ? filteredRows : allRows;
  return (
    <List
      height={150}
      itemCount={displayedRows.length}
      itemData={displayedRows}
      itemSize={35}
      width={300}
    >
      {Row}
    </List>
  );
}

export default function App({ ctx }: { ctx: CtxAsync }) {
  return <div></div>;
}

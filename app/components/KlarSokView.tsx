"use client";

import { useState } from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "../page.module.scss";
import { KlarSokPanel } from "./KlarSokPanel";

type TreeNode = {
  id: string;
  label: string;
  aktiv: boolean;
  children?: TreeNode[];
};

type SearchResult = {
  id: string;
  label: string;
  aktiv: boolean;
  tree: TreeNode[];
};

function collectExpandableIds(nodes: TreeNode[]): Set<string> {
  const ids = new Set<string>();
  function traverse(node: TreeNode) {
    if (node.children?.length) {
      ids.add(node.id);
      node.children.forEach(traverse);
    }
  }
  nodes.forEach(traverse);
  return ids;
}

function splitLabel(label: string): { link: string; rest: string } {
  const idx = label.indexOf("(");
  if (idx === -1) return { link: label, rest: "" };
  return { link: label.slice(0, idx).trim(), rest: " " + label.slice(idx) };
}

const ALMASSA_TREE: TreeNode[] = [
  {
    id: "kund-1000011",
    label: "Kund nr 1000011 (Fjällvik Bygghandel AB)",
    aktiv: true,
    children: [
      {
        id: "kontrakt-145692",
        label: "Kontrakt nr 145692 (Fjällvik Bygghandel AB)",
        aktiv: true,
        children: [
          {
            id: "lastorder-14164",
            label: "Lastorder nr 14164 (Fjällvik Bygghandel AB, 2024-03-20)",
            aktiv: true,
            children: [
              { id: "faktura-14726582", label: "Faktura nr 14726582 (Fjällvik Bygghandel AB)", aktiv: true },
            ],
          },
          {
            id: "transport-167562",
            label: "Transport nr 167562 (Krokom - Sundsvall, 2024-03-19)",
            aktiv: true,
            children: [
              { id: "p-4243399", label: "Paket nr 4243399 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu VI 5.1 Lp)", aktiv: true },
              { id: "p-4236372", label: "Paket nr 4236372 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu VI 5.4 Lp)", aktiv: true },
              { id: "p-4236354a", label: "Paket nr 4236354 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu VI 5.1 Lp)", aktiv: true },
              { id: "p-4236354b", label: "Paket nr 4236354 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu VI 4.8 Lp)", aktiv: true },
              { id: "p-4231613", label: "Paket nr 4231613 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 3.9 Lp)", aktiv: true },
              { id: "p-4231610", label: "Paket nr 4231610 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 4.5 Lp)", aktiv: true },
              { id: "p-4231608", label: "Paket nr 4231608 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 3.6 Lp)", aktiv: true },
              { id: "p-4231587", label: "Paket nr 4231587 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 4.5 Lp)", aktiv: true },
              { id: "p-4231586", label: "Paket nr 4231586 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 4.8 Lp)", aktiv: true },
              { id: "p-4231584", label: "Paket nr 4231584 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 3.9 Lp)", aktiv: true },
              { id: "p-4231583", label: "Paket nr 4231583 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 4.2 Lp)", aktiv: true },
              { id: "p-4231581", label: "Paket nr 4231581 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 5.1 Lp)", aktiv: true },
              { id: "p-4231580", label: "Paket nr 4231580 (Fageråsen Trä AB, 2023-12-21, 50x225 Furu V 4ex 4.5 Lp)", aktiv: true },
            ],
          },
          {
            id: "transport-167561",
            label: "Transport nr 167561 (Krokom - Sundsvall, 2024-03-19)",
            aktiv: true,
            children: [
              { id: "p-4243402a", label: "Paket nr 4243402 (Fageråsen Trä AB, 2024-03-13, 50x225 Furu V 4ex 4.2 Lp)", aktiv: true },
              { id: "p-4243402b", label: "Paket nr 4243402 (Fageråsen Trä AB, 2024-03-13, 50x225 Furu V 4ex 4.5 Lp)", aktiv: true },
              { id: "p-4243396", label: "Paket nr 4243396 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu V 4ex 3.9 Lp)", aktiv: true },
              { id: "p-4243394", label: "Paket nr 4243394 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu V 4ex 4.2 Lp)", aktiv: true },
              { id: "p-4243391", label: "Paket nr 4243391 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu V 4ex 5.4 Lp)", aktiv: true },
              { id: "p-4243389", label: "Paket nr 4243389 (Fageråsen Trä AB, 2024-03-12, 50x200 Furu V 5.1 Lp)", aktiv: true },
              { id: "p-4236339", label: "Paket nr 4236339 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu V 5.4 Lp)", aktiv: true },
              { id: "p-4236332", label: "Paket nr 4236332 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu V 4.5 Lp)", aktiv: true },
              { id: "p-4236325", label: "Paket nr 4236325 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu V 5.1 Lp)", aktiv: true },
              { id: "p-4236324", label: "Paket nr 4236324 (Fageråsen Trä AB, 2024-02-01, 50x225 Furu V 4.8 Lp)", aktiv: true },
              { id: "p-4224985", label: "Paket nr 4224985 (Fageråsen Trä AB, 2023-11-02, 50x225 Furu V 4ex 3.3 Lp)", aktiv: true },
              { id: "p-4224952", label: "Paket nr 4224952 (Fageråsen Trä AB, 2023-11-02, 50x225 Furu V 4ex 4.8 Lp)", aktiv: true },
              { id: "p-4224948", label: "Paket nr 4224948 (Fageråsen Trä AB, 2023-11-02, 50x225 Furu V 4ex 4.8 Lp)", aktiv: true },
            ],
          },
          {
            id: "transport-167526",
            label: "Transport nr 167526 (Krokom - Sundsvall, 2024-03-18)",
            aktiv: true,
            children: [
              { id: "p-4243422", label: "Paket nr 4243422 (Fageråsen Trä AB, 2024-03-13, 50x225 Furu V 5.1 Lp)", aktiv: true },
              { id: "p-4243421", label: "Paket nr 4243421 (Fageråsen Trä AB, 2024-03-13, 50x225 Furu V 4.8 Lp)", aktiv: true },
              { id: "p-4243408", label: "Paket nr 4243408 (Fageråsen Trä AB, 2024-03-13, 50x225 Furu V 3.9 Lp)", aktiv: true },
              { id: "p-4243406", label: "Paket nr 4243406 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu VI 3 Lp)", aktiv: true },
              { id: "p-4243404", label: "Paket nr 4243404 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu VI 4.5 Lp)", aktiv: true },
              { id: "p-4243401", label: "Paket nr 4243401 (Fageråsen Trä AB, 2024-03-12, 50x225 Furu V 3 Lp)", aktiv: true },
              { id: "p-4243387", label: "Paket nr 4243387 (Fageråsen Trä AB, 2024-03-12, 50x200 Furu V 4ex 5.4 Lp)", aktiv: true },
            ],
          },
        ],
      },
    ],
  },
];

const SEARCH_RESULTS: SearchResult[] = [
  { id: "kund-1000011", label: "Kund nr 1000011 (Fjällvik Bygghandel AB)", aktiv: true, tree: ALMASSA_TREE },
  { id: "kund-1000012", label: "Kund nr 1000012 (Ekstrand Sten & Grus AB)", aktiv: true, tree: [] },
  { id: "kontrakt-145692", label: "Kontrakt nr 145692 (Fjällvik Bygghandel AB)", aktiv: true, tree: [] },
  { id: "kund-1000013", label: "Kund nr 1000013 (Bergqvist Bygg HB)", aktiv: false, tree: [] },
  { id: "kontrakt-145700", label: "Kontrakt nr 145700 (Ekstrand Sten & Grus AB)", aktiv: true, tree: [] },
  { id: "lastorder-14164", label: "Lastorder nr 14164 (Fjällvik Bygghandel AB, 2024-03-20)", aktiv: true, tree: [] },
];

function TreeRow({
  node,
  depth,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = !!node.children?.length;
  const isSelected = selectedId === node.id;
  const { link, rest } = splitLabel(node.label);

  return (
    <>
      <div
        className={`${styles.klarSokTreeRow} ${isSelected ? styles.klarSokTreeRowSelected : ""}`}
        style={{ paddingLeft: depth * 16 }}
        onClick={() => onSelect(node.id)}
      >
        <button
          type="button"
          className={styles.klarSokExpandBtn}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
          tabIndex={hasChildren ? 0 : -1}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
        >
          {isExpanded
            ? <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
            : <KeyboardArrowRightIcon style={{ fontSize: 20 }} />
          }
        </button>
        <span className={styles.klarSokTreeLabel}>
          <span className={styles.klarSokTreeLink}>{link}</span>
          {rest && <span className={styles.klarSokTreeMeta}>{rest}</span>}
        </span>
        <span className={styles.klarSokTreeAktiv}>{node.aktiv ? "Ja" : "Nej"}</span>
      </div>
      {isExpanded && hasChildren && node.children!.map((child) => (
        <TreeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

export function KlarSokView() {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const selectedResult = SEARCH_RESULTS.find((r) => r.id === selectedResultId) ?? null;

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectResult = (id: string) => {
    setSelectedResultId(id);
    setSelectedTreeId(null);
    const result = SEARCH_RESULTS.find((r) => r.id === id);
    setExpandedIds(result ? collectExpandableIds(result.tree) : new Set());
  };

  return (
    <div className={styles.klarSokViewLayout}>
      <div className={styles.advancedSearchPanel}>
        <KlarSokPanel />
      </div>
      <div className={styles.klarSokTablesLayout}>
        <div className={styles.klarSokTablePanel}>
          <div className={styles.klarSokTableHead}>
            <div className={styles.klarSokTableHeadLabel}>Beskrivning</div>
            <div className={styles.klarSokTableHeadAktiv}>Aktiv</div>
          </div>
          <div className={styles.klarSokTableBody}>
            {SEARCH_RESULTS.map((row) => (
              <div
                key={row.id}
                className={`${styles.klarSokFlatRow} ${selectedResultId === row.id ? styles.klarSokFlatRowSelected : ""}`}
                onClick={() => handleSelectResult(row.id)}
              >
                <span className={styles.klarSokFlatRowLabel}>
                  {(() => { const { link, rest } = splitLabel(row.label); return <><span className={styles.klarSokTreeLink}>{link}</span>{rest && <span className={styles.klarSokTreeMeta}>{rest}</span>}</>; })()}
                </span>
                <span className={styles.klarSokFlatRowAktiv}>{row.aktiv ? "Ja" : "Nej"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.klarSokTablePanel}>
          <div className={styles.klarSokTableHead}>
            <div className={styles.klarSokTableHeadLabel}>Beskrivning</div>
            <div className={styles.klarSokTableHeadAktiv}>Aktiv</div>
          </div>
          <div className={styles.klarSokTableBody}>
            {selectedResult && selectedResult.tree.length > 0 ? (
              selectedResult.tree.map((node) => (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expandedIds={expandedIds}
                  selectedId={selectedTreeId}
                  onToggle={handleToggle}
                  onSelect={setSelectedTreeId}
                />
              ))
            ) : (
              <div className={styles.klarSokTableEmpty}>
                {selectedResultId ? "Ingen data tillgänglig" : "Välj en rad i tabellen till vänster"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

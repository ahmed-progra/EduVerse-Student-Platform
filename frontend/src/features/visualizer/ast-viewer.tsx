"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback, memo, type ReactNode } from "react";
import { ChevronRight, ChevronDown, Code2 } from "lucide-react";

interface ASTNodeData {
  type: string;
  line?: number;
  col?: number;
  props: Record<string, any>;
  children: ASTNodeData[];
}

// Skulpt's AST nodes are an untyped dynamic tree (no published types); `any` is the intentional
// boundary used throughout this file's traversal helpers.
let Sk: any = null;

function getNodeType(obj: any): string {
  if (!obj || typeof obj !== "object") return String(obj);
  if (obj.constructor?.$dct) {
    const name = obj.constructor.$dct["__name__"];
    if (name) return name.v || name;
  }
  if (obj.constructor?.name) return obj.constructor.name.replace("$", "");
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function extractProps(obj: any): Record<string, any> {
  const props: Record<string, any> = {};
  if (!obj || typeof obj !== "object") return props;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key === "parent" || key === "ctx") continue;
    const val = obj[key];
    if (val === null || val === undefined) continue;
    if (typeof val === "function") continue;
    if (typeof val === "object" && val.constructor?.$dct) {
      const tn = getNodeType(val);
      if (Sk?.astnodes && Object.values(Sk.astnodes).some((n: any) => getNodeType(n) === tn)) {
        continue;
      }
      if (tn === "Load" || tn === "Store" || tn === "Del") {
        props["ctx"] = tn;
        continue;
      }
      props[key] = formatValue(val);
    } else if (
      !(
        typeof val === "object" &&
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === "object" &&
        val[0]?.constructor?.$dct
      )
    ) {
      props[key] = formatValue(val);
    }
  }
  return props;
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return "None";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object" && val.constructor?.$dct) {
    return `<${getNodeType(val)}>`;
  }
  if (Array.isArray(val)) {
    return `[${val.map((v: any) => formatValue(v)).join(", ")}]`;
  }
  return String(val);
}

function isASTNode(val: any): boolean {
  if (!val || typeof val !== "object") return false;
  if (!Sk) return val.lineno !== undefined;
  const tn = getNodeType(val);
  return Sk.astnodes ? (Sk.astnodes as any)[tn] !== undefined : val.lineno !== undefined;
}

function buildASTTree(ast: any): ASTNodeData {
  const type = getNodeType(ast);
  const line =
    ast.lineno !== undefined
      ? typeof ast.lineno === "object"
        ? ast.lineno.v
        : ast.lineno
      : undefined;
  const col =
    ast.col_offset !== undefined
      ? typeof ast.col_offset === "object"
        ? ast.col_offset.v
        : ast.col_offset
      : undefined;

  const props: Record<string, any> = { ...extractProps(ast) };
  if (line !== undefined) props["lineno"] = line;

  const children: ASTNodeData[] = [];

  for (const key of Object.keys(ast)) {
    if (key.startsWith("$") || key === "parent" || key === "ctx") continue;
    const val = ast[key];
    if (val === null || val === undefined) continue;
    if (typeof val !== "object") continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === "object" && isASTNode(item)) {
          children.push(buildASTTree(item));
        }
      }
    } else if (isASTNode(val)) {
      children.push(buildASTTree(val));
    }
  }

  return { type, line, col, props, children };
}

interface ASTViewerProps {
  code: string;
  onLineClick?: (line: number) => void;
  visible: boolean;
  onToggle: () => void;
}

export const ASTViewer = memo(function ASTViewer({
  code,
  onLineClick,
  visible,
  onToggle,
}: ASTViewerProps) {
  const [tree, setTree] = useState<ASTNodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible || !code.trim()) return;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        if (!Sk) {
          const skulpt: any = await import("skulpt");
          Sk = skulpt.default || skulpt;
        }
        const cst = Sk.parse("<visualizer>", code);
        const ast = Sk.astFromParse(cst);
        const root = buildASTTree(ast);
        setTree(root);
      } catch (err: unknown) {
        setError(String(err));
        setTree(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, visible]);

  const toggleCollapse = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const renderNode = useCallback(
    (node: ASTNodeData, depth: number, path: string): ReactNode => {
      const isCollapsed = collapsed.has(path);
      const hasChildren = node.children.length > 0;
      const nodeKey = `${node.type}:${node.line || "?"}:${path}`;

      return (
        <div key={nodeKey} className="ast-node">
          <div
            className="ast-node-row"
            style={{ paddingLeft: `${depth * 14}px` }}
            onClick={() => {
              toggleCollapse(path);
              if (node.line && onLineClick) onLineClick(node.line);
            }}
          >
            <span className="ast-toggle">
              {hasChildren ? (
                isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )
              ) : (
                <span className="w-3 inline-block" />
              )}
            </span>
            <span className="ast-type">{node.type}</span>
            {node.line && <span className="ast-line">:{node.line}</span>}
            {Object.entries(node.props)
              .filter(([k]) => k !== "lineno")
              .slice(0, 3)
              .map(([k, v]) => (
                <span key={k} className="ast-prop">
                  <span className="ast-prop-key">{k}=</span>
                  <span className="ast-prop-val">{String(v).substring(0, 40)}</span>
                </span>
              ))}
            {Object.keys(node.props).filter((k) => k !== "lineno").length > 3 && (
              <span className="ast-more">+{Object.keys(node.props).length - 3} more</span>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <div className="ast-children">
              {node.children.map((child, i) => renderNode(child, depth + 1, `${path}.${i}`))}
            </div>
          )}
        </div>
      );
    },
    [collapsed, toggleCollapse, onLineClick],
  );

  return (
    <div className="visualizer-panel ast-panel">
      <div
        className="panel-header"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        aria-expanded={visible}
        aria-label={visible ? "Hide AST panel" : "Show AST panel"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-eduverse-accent-light" />
          <span className="panel-title">AST</span>
        </div>
        <span className="panel-badge">{visible ? "Hide" : "Show"}</span>
      </div>
      {visible && (
        <div className="panel-body ast-tree-body">
          {loading && <div className="panel-empty">Parsing...</div>}
          {error && (
            <div className="ast-error">
              <div className="ast-error-msg">Parse error</div>
              <div className="ast-error-detail">{error}</div>
            </div>
          )}
          {!loading && !error && !tree && <div className="panel-empty">Enter code to see AST</div>}
          {!loading && !error && tree && <div className="ast-tree">{renderNode(tree, 0, "0")}</div>}
        </div>
      )}
      {visible && tree && (
        <div className="panel-footer ast-footer">
          <div className="ast-stats">
            <span>{countNodes(tree)} nodes</span>
            <span className="ast-stat-sep">|</span>
            <span>{maxDepth(tree)} levels</span>
          </div>
        </div>
      )}
    </div>
  );
});

function countNodes(node: ASTNodeData): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

function maxDepth(node: ASTNodeData): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(maxDepth));
}

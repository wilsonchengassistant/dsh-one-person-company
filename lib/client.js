/**
 * dsh-one-person-company — browser half.
 *
 * Adds one button to the sidebar footer. Clicking it opens the current
 * workspace's task board in a dialog: every task with its status, priority,
 * owner, dependencies and readiness, read from `company/tasks/*.md` by the
 * Host Remote service in `lib/index.js`.
 *
 * Why the sidebar footer: it is a plain `renderSlot(name, { wide })` seat, so a
 * contribution is one component and no dockkit layout work. The dialog is
 * portalled into `document.body` because the sidebar footer sits inside a
 * transformed column, and a `position: fixed` child of a transformed ancestor
 * clips to that ancestor instead of the viewport.
 *
 * This file is served raw as a classic script and registers a factory; every
 * side effect, including `React.createElement` work, belongs inside it.
 */
window.__ModuleLoader__.load({
	id: "dsh-one-person-company",
	factory(require) {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var react = require("react");
		var jsx_runtime = require("react/jsx-runtime");

		/** Dictionary namespace owned by this plugin. */
		const NS = "onePersonCompany";

		/** The layout panel id: the sidebar row and the main page share it. */
		const PANEL_ID = "one-person-company";

		/**
		 * Simplified Chinese dictionary. DSH ships `zh` as Simplified; a separate
		 * `dsh-zh-hant` pack converts every bundle's `zh` dictionary to
		 * Traditional. Writing Traditional here would show Traditional text to
		 * Simplified users and make that conversion a no-op.
		 */
		const zh = {
			"mockup.review": "待审的 mockup",
			"mockup.hint": "下面是那个单文件 HTML，可以先玩四个状态。批准在对话里做：agent 会用 ask_user_question 问你。",
			"mockup.asked": "已记录的问题",
			"mockup.answered": "你的回答",
			"mockup.noAnswer": "还没有问过你。叫 agent 用 ask_user_question 发送批准请求。",
			"mockup.loading": "正在载入 mockup…",
			"mockup.failed": "mockup 载入失败",
			"mockup.changesHint": "如果这是需求变了（不只是画面），流程会先改 spec 再重做。",
			"mockup.tooLarge": "文件太大，没法在这里预览；请直接在浏览器打开它。",
			"mockup.unrecorded": "警告：档案里的批准记录没有问与答 —— 它不是你批准的对话。请重新问一次，再记录你的回答。",
			"mockup.rejected": "你要求过修改；改好 mockup，或者如果需求变了就先改 spec。",
			"mockup.stale": "mockup 在批准之后被改过，所以要再看一次。",
			"approvals.title": "Mockup 与批准记录",
			"approvals.approved": "已批准",
			"approvals.unsigned": "未批准（没有记录）",
			"approvals.unrecorded": "记录无效（没有问与答）",
			"approvals.rejected": "你要求修改",
			"approvals.stale": "批准之后改过",
			"approvals.missing": "mockup 文件不见了",
			"zoom.in": "放大",
			"zoom.out": "縮小",
			"zoom.fit": "全部顯示",
			"zoom.level": "縮放 {n}%",
			"minimap.label": "小地圖",
			"flow.pan": "按住中鍵可以拖動",
			"view.table": "表格",
			"view.flow": "流程圖",
			"flow.hint": "箭頭由前置 task 指向依賴佢嘅 task。滑鼠移上去睇詳情。",
			"flow.empty": "冇 task 可以畫。",
			"flow.links": "{n} 條依賴關係",
			"cycle.stage": "第 {n} 阶段 — {title}",
			"cycle.agent": "交给 agent 做",
			"cycle.human": "这一步由你决定",
			"cycle.copy": "复制 prompt 给 agent",
			"cycle.copied": "已复制",
			"doctor.run": "跑检查",
			"doctor.running": "检查中…",
			"doctor.summary": "{e} 个错误 · {w} 个警告",
			"doctor.failed": "检查跑不起来",
			"doctor.clean": "一切正常",
			"panel.label": "公司看板",
			"button.label": "公司看板",
			"button.aria": "打开公司任务看板",
			"dialog.title": "一人公司 · 任务看板",
			"dialog.workspace": "工作区",
			"dialog.refresh": "刷新",
			"dialog.close": "关闭",
			"dialog.loading": "正在读取…",
			"dialog.failed": "读取失败",
			"dialog.empty": "这个工作区还没有任务。先写 spec，再分解成 task。",
			"dialog.noCompany": "这个工作区还没有公司系统。",
			"dialog.bootstrapHint": "在这个资料夹执行 bootstrap.sh 就能建立。",
			"dialog.copyPath": "复制路径",
			"dialog.copied": "已复制",
			"bootstrap.action": "在这里建立公司系统",
			"bootstrap.hint": "会复制工具链、十份角色设定、playbook 与研究简报，并生成空的 charter 与任务板。",
			"bootstrap.running": "正在建立…",
			"bootstrap.done": "已建立",
			"bootstrap.failed": "建立失败",
			"col.id": "编号",
			"col.status": "状态",
			"col.priority": "优先",
			"col.owner": "负责",
			"col.title": "任务",
			"col.spec": "规格",
			"col.writes": "写入范围",
			"col.deps": "依赖",
			"summary.total": "总数",
			"summary.ready": "可开始",
			"summary.inProgress": "进行中",
			"summary.blocked": "受阻",
			"summary.done": "完成",
			"status.backlog": "待办",
			"status.ready": "就绪",
			"status.in_progress": "进行中",
			"status.review": "待审",
			"status.done": "完成",
			"status.blocked": "受阻",
			"status.dropped": "放弃",
			"badge.ready": "可做",
			"badge.unmet": "等 {n} 个前置",
			"badge.specDraft": "spec 未批准",
			"badge.unknownStatus": "状态值无效"
		};

		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"mockup.review": "Mockup to review",
			"mockup.hint": "This is the single-file HTML — play with the four states. Approval happens in the chat: the agent asks with ask_user_question.",
			"mockup.asked": "Question recorded",
			"mockup.answered": "Your answer",
			"mockup.noAnswer": "You have not been asked yet. Tell the agent to send the approval request with ask_user_question.",
			"mockup.loading": "Loading the mockup…",
			"mockup.failed": "Could not load the mockup",
			"mockup.changesHint": "If the requirement changed — not just the picture — the flow amends the spec first.",
			"mockup.tooLarge": "Too large to preview here — open the file in a browser instead.",
			"mockup.unrecorded": "Warning: the approval on file records no question and no answer — it is not a conversation you had. Ask again, then record the answer.",
			"mockup.rejected": "You asked for changes — rebuild the mockup, or amend the spec first if the requirement changed.",
			"mockup.stale": "This mockup changed after it was approved, so it needs looking at again.",
			"approvals.title": "Mockups and approvals",
			"approvals.approved": "approved",
			"approvals.unsigned": "not approved (no record)",
			"approvals.unrecorded": "not usable (no question or answer)",
			"approvals.rejected": "you asked for changes",
			"approvals.stale": "changed after approval",
			"approvals.missing": "mockup file missing",
			"zoom.in": "Zoom in",
			"zoom.out": "Zoom out",
			"zoom.fit": "Fit",
			"zoom.level": "{n}%",
			"minimap.label": "Minimap",
			"flow.pan": "Middle-drag to pan",
			"view.table": "Table",
			"view.flow": "Flow",
			"flow.hint": "Arrows run from a task to the tasks that depend on it. Hover a node for its details.",
			"flow.empty": "Nothing to draw yet.",
			"flow.links": "{n} dependency link(s)",
			"cycle.stage": "Stage {n} — {title}",
			"cycle.agent": "Hand this to an agent",
			"cycle.human": "This step is yours to decide",
			"cycle.copy": "Copy the prompt for the agent",
			"cycle.copied": "Copied",
			"doctor.run": "Run the checks",
			"doctor.running": "Running…",
			"doctor.summary": "{e} errors · {w} warnings",
			"doctor.failed": "The checks could not run",
			"doctor.clean": "Nothing to report",
			"panel.label": "Company board",
			"button.label": "Company board",
			"button.aria": "Open the company task board",
			"dialog.title": "One-person company · task board",
			"dialog.workspace": "Workspace",
			"dialog.refresh": "Refresh",
			"dialog.close": "Close",
			"dialog.loading": "Reading…",
			"dialog.failed": "Could not read it",
			"dialog.empty": "No tasks in this workspace yet. Write a spec, then decompose it.",
			"dialog.noCompany": "This workspace has no company OS yet.",
			"dialog.bootstrapHint": "Run bootstrap.sh in that folder to create one.",
			"dialog.copyPath": "Copy path",
			"dialog.copied": "Copied",
			"bootstrap.action": "Bootstrap this workspace",
			"bootstrap.hint": "Copies the tooling, the ten role charters, the playbook and the research briefs, then generates an empty charter and task board.",
			"bootstrap.running": "Creating the company OS…",
			"bootstrap.done": "Created",
			"bootstrap.failed": "Could not create it",
			"col.spec": "Spec",
			"col.writes": "Writes",
			"col.id": "ID",
			"col.status": "Status",
			"col.priority": "P",
			"col.owner": "Owner",
			"col.title": "Task",
			"col.deps": "Deps",
			"summary.total": "Total",
			"summary.ready": "Ready",
			"summary.inProgress": "In progress",
			"summary.blocked": "Blocked",
			"summary.done": "Done",
			"status.backlog": "Backlog",
			"status.ready": "Ready",
			"status.in_progress": "In progress",
			"status.review": "Review",
			"status.done": "Done",
			"status.blocked": "Blocked",
			"status.dropped": "Dropped",
			"badge.ready": "can start",
			"badge.unmet": "waits {n}",
			"badge.specDraft": "spec not approved",
			"badge.unknownStatus": "invalid status"
		};

		/** Status → theme colour, so the pill reads without a legend. */
		const STATUS_COLOR = {
			backlog: "var(--dsw-alias-label-tertiary)",
			ready: "var(--dsw-alias-state-business-primary)",
			in_progress: "var(--dsw-alias-state-warn-primary)",
			review: "var(--dsw-alias-link)",
			done: "var(--dsw-alias-state-success-primary)",
			blocked: "var(--dsw-alias-state-error-primary)",
			dropped: "var(--dsw-alias-label-caption)"
		};

		/**
		 * Call one method on this plugin's Host Remote service and unwrap the
		 * Gateway's result envelope.
		 *
		 * `Connection.rpc.call` resolves to the `{ok, value | error}` envelope
		 * itself, so every caller must unwrap: reading a field straight off the
		 * envelope fails silently with `undefined` rather than throwing.
		 *
		 * The Gateway derives its argument descriptor from the Host method's
		 * signature, so the parameterless `list` must be sent `{args:{}}`;
		 * `{args:{request:{}}}` is rejected with `gateway/arguments-invalid`.
		 *
		 * @param {object} ctx - Client root context.
		 * @param {string} method - Remote export name.
		 * @param {object} [request] - Wire request argument; omit for no parameters.
		 * @returns {Promise<object>} the decoded host result.
		 */
		async function callHost(ctx, method, request) {
			const payload = { args: request === undefined ? {} : { request } };
			const result = await ctx.connection.rpc.call("/api", `opcBoard/${method}`, payload);
			if (!result.ok) {
				const failure = new Error(result.error?.message ?? `the host refused opcBoard/${method}`);
				failure.code = result.error?.code;
				throw failure;
			}
			return result.value;
		}

		/**
		 * `jsx()` with variadic children, so the components below read like markup
		 * without needing a build step.
		 *
		 * @param {*} type - Element type.
		 * @param {object} [props] - Element props.
		 * @param {...*} children - Child nodes.
		 * @returns {*} a React element.
		 */
		function h(type, props, ...children) {
			const next = { ...(props ?? {}) };
			if (children.length === 1) next.children = children[0];
			else if (children.length > 1) next.children = children;
			return jsx_runtime.jsx(type, next);
		}

		/** Shared text styles. */
		const S = {
			title: { fontSize: "15px", fontWeight: 600, color: "var(--dsw-alias-label-primary)" },
			label: { fontSize: "12px", lineHeight: "16px", color: "var(--dsw-alias-label-tertiary)" },
			body: { fontSize: "13px", lineHeight: "18px", color: "var(--dsw-alias-label-primary)" },
			mono: {
				fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
				fontSize: "12px",
				color: "var(--dsw-alias-label-secondary)"
			}
		};

		/** A small rounded status chip. */
		function Pill(props) {
			const color = STATUS_COLOR[props.status] ?? "var(--dsw-alias-label-tertiary)";
			return h("span", {
				style: {
					display: "inline-block",
					padding: "1px 7px",
					borderRadius: "9px",
					border: `1px solid ${color}`,
					color,
					fontSize: "11px",
					lineHeight: "16px",
					whiteSpace: "nowrap"
				},
				children: props.children
			});
		}

		/** One summary number with its label under it. */
		function Stat(props) {
			return h("div", {
				style: { minWidth: "58px" },
				children: [
					h("div", { style: { ...S.title, fontSize: "17px" }, children: String(props.value) }),
					h("div", { style: S.label, children: props.label })
				]
			});
		}

		/** The task table. */
		/**
		 * Lay a task DAG out left to right: a column per dependency depth, a row per
		 * task within that depth.
		 *
		 * Depth is the longest path from a root, so a task never sits left of
		 * something it waits for. Cycles cannot be laid out — the graph has no
		 * "left" — so the recursion breaks and the doctor reports the cycle instead
		 * of the diagram hanging.
		 *
		 * @param {object[]} tasks - The board's tasks, as sent by the host.
		 * @returns {{nodes: object[], edges: object[], width: number, height: number}}
		 */
		function layoutFlow(tasks) {
			const NODE_W = 188;
			const NODE_H = 62;
			const COL_GAP = 64;
			const ROW_GAP = 16;
			const PAD = 18;

			const byId = new Map(tasks.map((task) => [task.id, task]));
			const depth = new Map();
			const visiting = new Set();

			const depthOf = (id) => {
				if (depth.has(id)) return depth.get(id);
				if (visiting.has(id)) return 0; // a cycle: stop, and let the doctor shout
				visiting.add(id);
				const task = byId.get(id);
				const parents = (task?.deps ?? []).filter((dep) => byId.has(dep));
				const value = parents.length === 0 ? 0 : 1 + Math.max(...parents.map(depthOf));
				visiting.delete(id);
				depth.set(id, value);
				return value;
			};
			for (const task of tasks) depthOf(task.id);

			// Within a column, the work that can start first goes on top.
			const rank = (task) => task.priority ?? "P9";
			const columns = new Map();
			for (const task of tasks) {
				const level = depth.get(task.id) ?? 0;
				if (!columns.has(level)) columns.set(level, []);
				columns.get(level).push(task);
			}
			for (const column of columns.values()) {
				column.sort((a, b) => {
					if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
					return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
				});
			}

			const maxLevel = Math.max(0, ...[...columns.keys()]);
			const rows = Math.max(1, ...[...columns.values()].map((column) => column.length));

			const nodes = [];
			for (const [level, column] of [...columns.entries()]) {
				column.forEach((task, index) => {
					nodes.push({
						task,
						level,
						x: PAD + level * (NODE_W + COL_GAP),
						y: PAD + index * (NODE_H + ROW_GAP),
						w: NODE_W,
						h: NODE_H
					});
				});
			}
			const position = new Map(nodes.map((node) => [node.task.id, node]));

			const edges = [];
			for (const node of nodes) {
				for (const dep of node.task.deps ?? []) {
					const parent = position.get(dep);
					if (parent === undefined) continue;
					const x1 = parent.x + parent.w;
					const y1 = parent.y + parent.h / 2;
					const x2 = node.x;
					const y2 = node.y + node.h / 2;
					const mid = x1 + (x2 - x1) / 2;
					edges.push({
						from: parent.task.id,
						to: node.task.id,
						d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
						// An edge into a task that cannot start yet is the interesting one.
						waiting: (node.task.unmetDeps ?? []).includes(dep)
					});
				}
			}

			return {
				nodes,
				edges,
				width: PAD * 2 + (maxLevel + 1) * NODE_W + maxLevel * COL_GAP,
				height: PAD * 2 + rows * NODE_H + (rows - 1) * ROW_GAP
			};
		}

		/** The zoom steps. A power graph is readable at 1:1 and unreadable at 0.3. */
		const ZOOM_STEPS = [0.3, 0.4, 0.5, 0.65, 0.8, 1, 1.25, 1.5, 2];

		/**
		 * The board as a dependency graph.
		 *
		 * A table answers "what is there"; a graph answers "what is waiting on what",
		 * which is the question a founder actually has when the board is stuck.
		 *
		 * Three things about the layout matter:
		 *  - the SVG lives in a scroll container, so zooming is a CSS transform on an
		 *    inner box whose size is scaled to match — otherwise the scroll bars lie;
		 *  - the hover card is a sibling of the scroll container, not a child, because
		 *    a child would be clipped by `overflow: auto` exactly when it matters;
		 *  - middle-drag pans, because a diagram you have to aim at a scrollbar to
		 *    move is a diagram nobody explores.
		 */
		function TaskFlow(props) {
			const { tasks, t } = props;
			const [hovered, setHovered] = react.useState(null);
			const [pointer, setPointer] = react.useState({ x: 0, y: 0 });
			const [zoom, setZoom] = react.useState(1);
			const [panning, setPanning] = react.useState(false);
			const [view, setView] = react.useState({ left: 0, top: 0, width: 0, height: 0 });

			const wrapRef = react.useRef(null);
			const scrollRef = react.useRef(null);

			const layout = react.useMemo(() => layoutFlow(tasks), [tasks]);
			const nodeById = react.useMemo(() => new Map(layout.nodes.map((node) => [node.task.id, node])), [layout]);

			// One hop in each direction: what this waits for, and what waits for it.
			const related = react.useMemo(() => {
				if (hovered === null) return null;
				const set = new Set([hovered]);
				for (const edge of layout.edges) {
					if (edge.to === hovered) set.add(edge.from);
					if (edge.from === hovered) set.add(edge.to);
				}
				return set;
			}, [hovered, layout]);

			const hoveredNode = hovered === null ? null : nodeById.get(hovered) ?? null;

			// Track the scroll box so the minimap can show where we are.
			const readView = react.useCallback(() => {
				const el = scrollRef.current;
				if (el === null) return;
				setView({ left: el.scrollLeft, top: el.scrollTop, width: el.clientWidth, height: el.clientHeight });
			}, []);

			react.useEffect(() => {
				readView();
				const el = scrollRef.current;
				if (el === null) return undefined;
				el.addEventListener("scroll", readView, { passive: true });
				const observer = typeof ResizeObserver === "function" ? new ResizeObserver(readView) : null;
				if (observer !== null) observer.observe(el);
				return () => {
					el.removeEventListener("scroll", readView);
					if (observer !== null) observer.disconnect();
				};
			}, [readView]);

			// Reset the scroll position when the zoom changes, keeping the centre.
			react.useEffect(() => {
				const el = scrollRef.current;
				if (el === null) return;
				readView();
			}, [zoom, readView]);

			const setZoomClamped = (next) => {
				const value = Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], next));
				setZoom(value);
			};

			const stepZoom = (direction) => {
				const index = ZOOM_STEPS.findIndex((step) => step >= zoom - 0.001);
				const current = index === -1 ? ZOOM_STEPS.length - 1 : index;
				const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, current + direction))];
				setZoomClamped(next);
			};

			const fit = () => {
				const el = scrollRef.current;
				if (el === null) return;
				const next = Math.min(el.clientWidth / layout.width, el.clientHeight / layout.height) * 0.96;
				setZoomClamped(Math.floor(next * 20) / 20);
			};

			// Middle-button drag: the gesture people expect from a canvas.
			const onMouseDown = (event) => {
				if (event.button !== 1) return;
				event.preventDefault();
				const el = scrollRef.current;
				if (el === null) return;
				const origin = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop };
				setPanning(true);
				const move = (moveEvent) => {
					el.scrollLeft = origin.left - (moveEvent.clientX - origin.x);
					el.scrollTop = origin.top - (moveEvent.clientY - origin.y);
				};
				const stop = () => {
					setPanning(false);
					window.removeEventListener("mousemove", move);
					window.removeEventListener("mouseup", stop);
				};
				window.addEventListener("mousemove", move);
				window.addEventListener("mouseup", stop);
			};

			const onEnter = (id) => (event) => {
				setHovered(id);
				// Client coordinates: the card is `position: fixed`, so it is clamped to
				// the window instead of to a box that may itself be off screen.
				setPointer({ x: event.clientX, y: event.clientY });
			};

			const truncate = (text, max) => {
				const value = String(text ?? "");
				return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
			};

			// `agent:engineer` fits, `human:founder` does not — the node is 188px.
			const shortOwner = (owner) => {
				const value = String(owner ?? "");
				if (value === "") return "—";
				const trimmed = value.replace(/^agent:/, "").replace(/^human:/, "");
				return trimmed.length <= 14 ? trimmed : `${trimmed.slice(0, 13)}…`;
			};

			if (layout.nodes.length === 0) {
				return h("div", { style: { padding: "18px 4px", ...S.label }, children: t("flow.empty") });
			}

			const statusColor = (status) => STATUS_COLOR[status] ?? "var(--dsw-alias-label-tertiary)";

			const scaledWidth = layout.width * zoom;
			const scaledHeight = layout.height * zoom;

			// The hover card is `position: fixed` and clamped to the window. As a child
			// of the scroll container it would be clipped by `overflow: auto` exactly
			// when it matters; as a child of the wrapper it was still clipped by the
			// bottom of the window when the diagram was tall.
			const CARD_W = 300;
			const CARD_H = 230;
			const viewportW = typeof window === "undefined" ? 1200 : window.innerWidth;
			const viewportH = typeof window === "undefined" ? 800 : window.innerHeight;
			const cardLeft = Math.max(8, Math.min(pointer.x + 16, viewportW - CARD_W - 8));
			const cardTop = Math.max(8, Math.min(pointer.y + 16, viewportH - CARD_H - 8));

			// Minimap geometry: the whole graph, plus a rectangle for what is on screen.
			const MAP_W = 172;
			const MAP_H = Math.max(56, Math.min(120, Math.round((MAP_W * layout.height) / layout.width)));
			const mapScale = Math.min(MAP_W / layout.width, MAP_H / layout.height);
			const viewRect = {
				x: (view.left / zoom) * mapScale,
				y: (view.top / zoom) * mapScale,
				w: (view.width / zoom) * mapScale,
				h: (view.height / zoom) * mapScale
			};

			const jumpTo = (event) => {
				const el = scrollRef.current;
				if (el === null) return;
				const box = event.currentTarget.getBoundingClientRect();
				const x = (event.clientX - box.left) / mapScale;
				const y = (event.clientY - box.top) / mapScale;
				el.scrollLeft = x * zoom - el.clientWidth / 2;
				el.scrollTop = y * zoom - el.clientHeight / 2;
			};

			const smallButton = {
				width: "26px",
				height: "22px",
				borderRadius: "5px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-secondary)",
				cursor: "pointer",
				fontSize: "13px",
				lineHeight: 1,
				padding: 0
			};

			return h("div", {
				ref: wrapRef,
				style: {
					position: "relative",
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: "8px",
					background: "var(--dsw-alias-bg-layer-1)",
					overflow: "visible"
				},
				children: [
					// toolbar — outside the scroller, so it never scrolls away
					h("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "7px 12px",
							borderBottom: "1px solid var(--dsw-alias-border-l2)",
							flexWrap: "wrap"
						},
						children: [
							h("span", {
								style: { ...S.label, flex: 1, minWidth: "160px" },
								children: `${t("flow.hint")} · ${t("flow.links", { n: layout.edges.length })} · ${t("flow.pan")}`
							}),
							h("button", { type: "button", title: t("zoom.out"), "aria-label": t("zoom.out"), style: smallButton, onClick: () => stepZoom(-1), children: "−" }),
							h("span", { style: { ...S.label, minWidth: "42px", textAlign: "center" }, children: t("zoom.level", { n: Math.round(zoom * 100) }) }),
							h("button", { type: "button", title: t("zoom.in"), "aria-label": t("zoom.in"), style: smallButton, onClick: () => stepZoom(1), children: "+" }),
							h("button", { type: "button", title: t("zoom.fit"), "aria-label": t("zoom.fit"), style: { ...smallButton, width: "auto", padding: "0 8px" }, onClick: fit, children: t("zoom.fit") })
						]
					}),
					// the scroll box
					h("div", {
						ref: scrollRef,
						"data-opc": "flow-scroll",
						onMouseDown,
						onAuxClick: (event) => event.preventDefault(),
						style: {
							overflow: "auto",
							maxHeight: "520px",
							cursor: panning ? "grabbing" : "default",
							userSelect: panning ? "none" : undefined
						},
						children: h("div", {
							style: { width: scaledWidth, height: scaledHeight },
							children: h("div", {
								style: { transform: `scale(${zoom})`, transformOrigin: "0 0", width: layout.width, height: layout.height },
								children: h("svg", {
									width: layout.width,
									height: layout.height,
									style: { display: "block" },
									children: [
										h("defs", {
											children: h("marker", {
												id: "opc-arrow",
												viewBox: "0 0 10 10",
												refX: "9",
												refY: "5",
												markerWidth: "7",
												markerHeight: "7",
												orient: "auto-start-reverse",
												children: h("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "var(--dsw-alias-label-tertiary)" })
											})
										}),
										...layout.edges.map((edge) => {
											const active = related === null || (related.has(edge.from) && related.has(edge.to));
											const highlighted = hovered !== null && (edge.from === hovered || edge.to === hovered);
											return h("path", {
												key: `${edge.from}->${edge.to}`,
												d: edge.d,
												fill: "none",
												stroke: highlighted
													? "var(--dsw-alias-state-business-primary)"
													: edge.waiting
														? "var(--dsw-alias-state-warn-primary)"
														: "var(--dsw-alias-label-tertiary)",
												strokeWidth: highlighted ? 2 : 1.2,
												strokeDasharray: edge.waiting && !highlighted ? "4 3" : undefined,
												opacity: active ? 1 : 0.25,
												markerEnd: "url(#opc-arrow)"
											});
										}),
										...layout.nodes.map((node) => {
											const task = node.task;
											const dim = related !== null && !related.has(task.id);
											const isHovered = hovered === task.id;
											return h("g", {
												key: task.id,
												onMouseEnter: onEnter(task.id),
												onMouseMove: onEnter(task.id),
												onMouseLeave: () => setHovered(null),
												style: { cursor: "pointer" },
												opacity: dim ? 0.4 : 1,
												children: [
													h("rect", {
														x: node.x,
														y: node.y,
														width: node.w,
														height: node.h,
														rx: 8,
														fill: "var(--dsw-alias-bg-layer-2)",
														stroke: isHovered ? "var(--dsw-alias-state-business-primary)" : "var(--dsw-alias-border-l2)",
														strokeWidth: isHovered ? 2 : 1
													}),
													h("rect", { x: node.x, y: node.y, width: 4, height: node.h, rx: 2, fill: statusColor(task.status) }),
													h("text", {
														x: node.x + 14,
														y: node.y + 19,
														style: { fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: "10.5px", fill: "var(--dsw-alias-label-tertiary)" },
														children: `${task.id}  ${shortOwner(task.owner)}`
													}),
													h("text", {
														x: node.x + 14,
														y: node.y + 37,
														style: { fontSize: "12.5px", fill: "var(--dsw-alias-label-primary)" },
														children: truncate(task.title, 26)
													}),
													h("text", {
														x: node.x + 14,
														y: node.y + 52,
														style: { fontSize: "10.5px", fill: statusColor(task.status) },
														children: [
															t(`status.${task.status}`),
															task.ready ? ` · ${t("badge.ready")}` : "",
															(task.unmetDeps ?? []).length ? ` · ${t("badge.unmet", { n: task.unmetDeps.length })}` : ""
														].join("")
													})
												]
											});
										})
									]
								})
							})
						})
					}),
					// minimap — bottom right, clickable
					h("div", {
						style: {
							position: "absolute",
							right: "10px",
							bottom: "10px",
							border: "1px solid var(--dsw-alias-border-l2)",
							borderRadius: "6px",
							background: "var(--dsw-alias-bg-layer-1)",
							boxShadow: "0 4px 12px rgba(0,0,0,.14)",
							padding: "4px",
							opacity: 0.94
						},
						children: h("svg", {
							role: "img",
							"data-opc": "flow-minimap",
							"aria-label": t("minimap.label"),
							width: MAP_W,
							height: MAP_H,
							style: { display: "block", cursor: "pointer" },
							onClick: jumpTo,
							children: [
								h("rect", { x: 0, y: 0, width: MAP_W, height: MAP_H, fill: "var(--dsw-alias-bg-layer-2)", rx: 4 }),
								...layout.nodes.map((node) =>
									h("rect", {
										key: `mini-${node.task.id}`,
										x: node.x * mapScale,
										y: node.y * mapScale,
										width: Math.max(2, node.w * mapScale),
										height: Math.max(2, node.h * mapScale),
										rx: 1,
										fill: statusColor(node.task.status),
										opacity: hovered === null || related?.has(node.task.id) ? 0.85 : 0.3
									})
								),
								h("rect", {
									x: viewRect.x,
									y: viewRect.y,
									width: Math.max(6, viewRect.w),
									height: Math.max(6, viewRect.h),
									fill: "none",
									stroke: "var(--dsw-alias-state-business-primary)",
									strokeWidth: 1.2,
									rx: 2
								})
							]
						})
					}),
					// hover card — a sibling of the scroller, so nothing clips it
					hoveredNode !== null &&
						h("div", {
							style: {
								position: "fixed",
								left: `${cardLeft}px`,
								top: `${cardTop}px`,
								width: `${CARD_W}px`,
								boxSizing: "border-box",
								maxHeight: "70vh",
								overflow: "hidden",
								padding: "10px 12px",
								borderRadius: "8px",
								border: "1px solid var(--dsw-alias-border-l2)",
								background: "var(--dsw-alias-bg-layer-1)",
								boxShadow: "0 8px 24px rgba(0,0,0,.18)",
								pointerEvents: "none",
								zIndex: 5,
								...S.body
							},
							children: [
								h("div", { style: { ...S.mono, color: "var(--dsw-alias-label-tertiary)" }, children: hoveredNode.task.id }),
								h("div", { style: { ...S.title, fontSize: "13px", marginTop: "2px" }, children: hoveredNode.task.title }),
								h("div", {
									style: { marginTop: "6px", display: "flex", gap: "8px", flexWrap: "wrap", ...S.label },
									children: [
										h("span", { style: { color: statusColor(hoveredNode.task.status), fontWeight: 600 }, children: t(`status.${hoveredNode.task.status}`) }),
										h("span", { children: hoveredNode.task.priority ?? "" }),
										hoveredNode.task.owner && h("span", { children: hoveredNode.task.owner })
									]
								}),
								hoveredNode.task.spec &&
									h("div", {
										style: { marginTop: "6px", ...S.label, overflowWrap: "anywhere" },
										children: [
											h("div", { children: `${t("col.spec")}: ${hoveredNode.task.spec}` }),
											hoveredNode.task.specApproved === false &&
												h("div", { style: { color: "var(--dsw-alias-state-warn-primary)" }, children: t("badge.specDraft") })
										]
									}),
								(hoveredNode.task.deps ?? []).length > 0 &&
									h("div", { style: { marginTop: "6px", ...S.label }, children: `${t("col.deps")}: ${hoveredNode.task.deps.join(", ")}` }),
								(hoveredNode.task.writes ?? []).length > 0 &&
									h("div", { style: { marginTop: "4px", ...S.label, overflowWrap: "anywhere" }, children: `${t("col.writes")}: ${hoveredNode.task.writes.join(", ")}` }),
								hoveredNode.task.design &&
									String(hoveredNode.task.design).toLowerCase() !== "none" &&
									h("div", { style: { marginTop: "4px", ...S.label, overflowWrap: "anywhere" }, children: `design: ${hoveredNode.task.design}` })
							]
						})
				]
			});
		}

		function TaskTable(props) {
			const { tasks, t } = props;
			const head = [t("col.id"), t("col.status"), t("col.priority"), t("col.owner"), t("col.title"), t("col.deps")];
			return h("div", {
				style: { overflow: "auto", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "8px" },
				children: h("table", {
					style: { width: "100%", borderCollapse: "collapse", ...S.body },
					children: [
						h("thead", {
							children: h("tr", {
								children: head.map((label, index) =>
									h("th", {
										key: label,
										style: {
											textAlign: "left",
											padding: "7px 10px",
											position: "sticky",
											top: 0,
											background: "var(--dsw-alias-bg-layer-2)",
											borderBottom: "1px solid var(--dsw-alias-border-l2)",
											...S.label,
											fontWeight: 600,
											// Priority is a single character; do not let it take a column.
											width: index === 2 ? "34px" : undefined
										},
										children: label
									})
								)
							})
						}),
						h("tbody", {
							children: tasks.map((task) =>
								h("tr", {
									key: task.id,
									style: { borderBottom: "1px solid var(--dsw-alias-border-l1)" },
									children: [
										h("td", {
											style: { padding: "7px 10px", whiteSpace: "nowrap", ...S.mono },
											children: task.id
										}),
										h("td", {
											style: { padding: "7px 10px", whiteSpace: "nowrap" },
											children: h(Pill, {
												status: task.status,
												children: [
													t(`status.${task.status}`) === `status.${task.status}` ? task.status : t(`status.${task.status}`),
													task.ready ? " · " + t("badge.ready") : ""
												].join("")
											})
										}),
										h("td", {
											style: { padding: "7px 10px", ...S.mono },
											children: task.priority
										}),
										h("td", {
											style: { padding: "7px 10px", whiteSpace: "nowrap", ...S.mono },
											children: task.owner || "—"
										}),
										h("td", {
											style: { padding: "7px 10px" },
											children: [
												h("div", { children: task.title }),
												h("div", {
													style: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "3px" },
													children: [
														task.unmetDeps.length > 0 &&
															h("span", { style: { ...S.label, color: "var(--dsw-alias-state-warn-primary)" }, children: t("badge.unmet", { n: task.unmetDeps.length }) }),
														task.missingDeps.length > 0 &&
															h("span", { style: { ...S.label, color: "var(--dsw-alias-state-error-primary)" }, children: `${task.missingDeps.length} missing` }),
														task.spec && !task.specApproved &&
															h("span", { style: { ...S.label, color: "var(--dsw-alias-state-warn-primary)" }, children: t("badge.specDraft") }),
														task.unknownStatus &&
															h("span", { style: { ...S.label, color: "var(--dsw-alias-state-error-primary)" }, children: t("badge.unknownStatus") })
													].filter(Boolean)
												})
											]
										}),
										h("td", {
											style: { padding: "7px 10px", ...S.mono, color: "var(--dsw-alias-label-tertiary)" },
											children: task.deps.length ? task.deps.join(" ") : "—"
										})
									]
								})
							)
						})
					]
				})
			});
		}

		/**
		 * The empty state, with the action that fixes it.
		 *
		 * Bootstrap runs on the Host against the workspace path held by the
		 * registry — the browser never sends a path, so this cannot write
		 * anywhere the user has not already added as a workspace.
		 */
		function BootstrapPanel(props) {
			const { entry, t, onCopy, copied, onBootstrap, onDone } = props;
			const [state, setState] = react.useState({ status: "idle", output: "", error: null });

			const run = react.useCallback(async () => {
				setState({ status: "running", output: "", error: null });
				try {
					const result = await onBootstrap(entry.id);
					if (result?.already) {
						onDone();
						return;
					}
					if (result?.ok) {
						setState({ status: "done", output: result.output ?? "", error: null });
						onDone();
						return;
					}
					setState({
						status: "failed",
						output: result?.output ?? "",
						error: result?.error ?? t("bootstrap.failed")
					});
				} catch (error) {
					setState({ status: "failed", output: "", error: String(error?.message ?? error) });
				}
			}, [entry.id, onBootstrap, onDone, t]);

			const busy = state.status === "running";
			return h("div", {
				style: { padding: "16px 4px", display: "flex", flexDirection: "column", gap: "12px" },
				children: [
					h("div", {
						children: [
							h("div", { style: S.body, children: t("dialog.noCompany") }),
							h("div", { style: { ...S.label, marginTop: "6px", maxWidth: "62ch" }, children: t("bootstrap.hint") })
						]
					}),
					h("div", {
						style: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
						children: [
							h("button", {
								type: "button",
								disabled: busy,
								onClick: () => void run(),
								style: {
									padding: "6px 14px",
									borderRadius: "7px",
									border: "1px solid transparent",
									background: busy ? "var(--dsw-alias-border-l2)" : "var(--dsw-alias-state-business-primary)",
									color: busy ? "var(--dsw-alias-label-tertiary)" : "var(--dsw-alias-label-primary-inverted, #fff)",
									cursor: busy ? "default" : "pointer",
									fontSize: "13px",
									fontWeight: 500
								},
								children: busy ? t("bootstrap.running") : t("bootstrap.action")
							}),
							h("code", { title: entry.path, style: { ...S.mono, overflowWrap: "anywhere" }, children: entry.displayPath ?? entry.path }),
							h("button", {
								type: "button",
								onClick: () => onCopy(entry.path),
								style: {
									padding: "3px 9px",
									borderRadius: "6px",
									border: "1px solid var(--dsw-alias-border-l2)",
									background: "transparent",
									color: "var(--dsw-alias-link)",
									cursor: "pointer",
									fontSize: "11px"
								},
								children: copied === entry.path ? t("dialog.copied") : t("dialog.copyPath")
							})
						]
					}),
					state.status === "failed" &&
						h("div", {
							role: "alert",
							style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" },
							children: [
								h("div", { children: `${t("bootstrap.failed")}: ${state.error}` }),
								state.output
									? h("pre", {
											style: {
												marginTop: "6px",
												maxHeight: "180px",
												overflow: "auto",
												padding: "8px 10px",
												borderRadius: "6px",
												background: "var(--dsw-alias-bg-layer-2)",
												color: "var(--dsw-alias-label-secondary)",
												fontSize: "11px",
												whiteSpace: "pre-wrap"
											},
											children: state.output
										})
									: null
							]
						}),
					state.status === "done" &&
						h("div", { style: { ...S.label, color: "var(--dsw-alias-state-success-primary)" }, children: t("bootstrap.done") })
				]
			});
		}

		/** The dialog body for one workspace. */
		function WorkspaceBoard(props) {
			const { entry, t, onCopy, copied } = props;
			// Table for scanning, flow for "what is waiting on what". The choice
			// survives a refresh because it lives above the reload.
			const [view, setView] = react.useState("table");
			if (!entry.hasCompany) {
				return h(BootstrapPanel, {
					entry,
					t,
					copied,
					onCopy,
					onBootstrap: props.onBootstrap,
					onDone: props.onRefresh
				});
			}
			if (entry.error !== null) {
				return h("div", {
					role: "alert",
					style: { padding: "14px 4px", color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" },
					children: `${t("dialog.failed")}: ${entry.error}`
				});
			}
			if (entry.tasks.length === 0) {
				return h("div", { style: { padding: "18px 4px", ...S.label }, children: t("dialog.empty") });
			}
			const s = entry.summary ?? {};
			const counts = s.counts ?? {};
			return h("div", {
				style: { display: "flex", flexDirection: "column", gap: "12px" },
				children: [
					h("div", {
						style: { display: "flex", gap: "20px", flexWrap: "wrap" },
						children: [
							h(Stat, { label: t("summary.total"), value: s.total ?? entry.tasks.length }),
							h(Stat, { label: t("summary.ready"), value: s.ready ?? 0 }),
							h(Stat, { label: t("summary.inProgress"), value: counts.in_progress ?? 0 }),
							h(Stat, { label: t("summary.blocked"), value: counts.blocked ?? 0 }),
							h(Stat, { label: t("summary.done"), value: counts.done ?? 0 })
						]
					}),
					h("div", {
						style: { display: "flex", alignItems: "center", gap: "6px" },
						children: [
							h("div", { style: { flex: 1 } }),
							h("div", {
								role: "group",
								"aria-label": t("view.table"),
								style: {
									display: "flex",
									gap: "2px",
									padding: "2px",
									borderRadius: "7px",
									border: "1px solid var(--dsw-alias-border-l2)",
									background: "var(--dsw-alias-bg-layer-2)"
								},
								children: ["table", "flow"].map((id) =>
									h("button", {
										key: id,
										type: "button",
										"aria-pressed": view === id,
										onClick: () => setView(id),
										style: {
											padding: "3px 12px",
											borderRadius: "5px",
											border: "1px solid transparent",
											cursor: "pointer",
											fontSize: "12px",
											background:
												view === id
													? "var(--dsw-alias-bg-layer-1)"
													: "transparent",
											color:
												view === id
													? "var(--dsw-alias-label-primary)"
													: "var(--dsw-alias-label-tertiary)",
											fontWeight: view === id ? 600 : 400,
											boxShadow: view === id ? "0 1px 2px rgba(0,0,0,.08)" : "none"
										},
										children: t(`view.${id}`)
									})
								)
							})
						]
					}),
					view === "flow"
						? h(TaskFlow, { t, tasks: entry.tasks })
						: h(TaskTable, { t, tasks: entry.tasks })
				]
			});
		}

		/**
		 * The company board, as a full page in the main area.
		 *
		 * Everything a founder needs to run the company is on this page: where the
		 * project is in the cycle, the exact prompt for the next step (one click
		 * copies it), the consistency checks, and the board itself. The point is
		 * that no one has to open a terminal to operate it.
		 */
		function OpcBoardPage(props) {
			const { t, loadBoard, bootstrapWorkspace, loadCycle, runDoctor, loadDesign } = props;
			const [state, setState] = react.useState({ status: "idle", workspaces: [], selected: null, error: null });
			const [cycle, setCycle] = react.useState({ status: "idle", data: null, error: null });
			const [doctor, setDoctor] = react.useState({ status: "idle", data: null, error: null });
			const [copied, setCopied] = react.useState(null);
			const [mockup, setMockup] = react.useState({ status: "idle", html: "", file: null, approved: false, error: null, tooLarge: false });

			const loadCycleInto = react.useCallback(
				async (id) => {
					setCycle({ status: "loading", data: null, error: null });
					try {
						const data = await loadCycle(id);
						setCycle({ status: "ready", data, error: null });
					} catch (error) {
						setCycle({ status: "failed", data: null, error: String(error?.message ?? error) });
					}
				},
				[loadCycle]
			);

			// The workspace to keep when the list refreshes. A ref, not state: the
			// refresh reads it synchronously, and a setState updater does not run
			// early enough to hand a value back to the code that scheduled it.
			const stateRef = react.useRef(state);
			stateRef.current = state;

			const refresh = react.useCallback(async () => {
				setState((current) => ({ ...current, status: "loading", error: null }));
				try {
					const result = await loadBoard();
					const workspaces = result?.workspaces ?? [];
					const keep = workspaces.find((entry) => entry.id === stateRef.current.selected)?.id;
					const chosen =
						keep ?? workspaces.find((entry) => entry.hasCompany)?.id ?? workspaces[0]?.id ?? null;
					setState({ status: "ready", workspaces, selected: chosen, error: null });
					const entry = workspaces.find((workspace) => workspace.id === chosen);
					if (entry?.hasCompany) void loadCycleInto(chosen);
					else setCycle({ status: "idle", data: null, error: null });
				} catch (error) {
					setState({ status: "failed", workspaces: [], selected: null, error: String(error?.message ?? error) });
				}
			}, [loadBoard, loadCycleInto]);

			react.useEffect(() => {
				void refresh();
			}, [refresh]);


			const selected = state.workspaces.find((entry) => entry.id === state.selected) ?? null;
			const stage = cycle.data?.stage ?? null;

			const pending = cycle.data?.pendingMockups?.[0] ?? null;
			const stageMockup = cycle.data?.stage?.mockup ?? null;
			const reviewTarget = pending ?? stageMockup;
			const mockupFile = reviewTarget?.file ?? null;
			const mockups = cycle.data?.mockups ?? [];
			const workspaceId = selected?.id ?? null;

			react.useEffect(() => {
				if (mockupFile === null || workspaceId === null) {
					setMockup({ status: "idle", html: "", file: null, approved: false, error: null, tooLarge: false });
					return;
				}
				let cancelled = false;
				setMockup({ status: "loading", html: "", file: mockupFile, approved: false, error: null, tooLarge: false });
				loadDesign(workspaceId, mockupFile)
					.then((result) => {
						if (cancelled) return;
						setMockup({
							status: "ready",
							html: result?.html ?? "",
							file: mockupFile,
							approved: Boolean(result?.approved),
							tooLarge: Boolean(result?.tooLarge),
							error: null
						});
					})
					.catch((error) => {
						if (cancelled) return;
						setMockup({ status: "failed", html: "", file: mockupFile, approved: false, tooLarge: false, error: String(error?.message ?? error) });
					});
				return () => {
					cancelled = true;
				};
			}, [mockupFile, workspaceId, loadDesign]);

			const pickWorkspace = (id) => {
				setState((current) => ({ ...current, selected: id }));
				setDoctor({ status: "idle", data: null, error: null });
				const entry = state.workspaces.find((w) => w.id === id);
				if (entry?.hasCompany) void loadCycleInto(id);
				else setCycle({ status: "idle", data: null, error: null });
			};

			const copyPrompt = () => {
				if (stage === null) return;
				void navigator.clipboard?.writeText(stage.prompt);
				setCopied("prompt");
			};

			const run = async () => {
				if (selected === null) return;
				setDoctor({ status: "running", data: null, error: null });
				try {
					const data = await runDoctor(selected.id);
					setDoctor({ status: "ready", data, error: null });
				} catch (error) {
					setDoctor({ status: "failed", data: null, error: String(error?.message ?? error) });
				}
			};

			const buttonStyle = {
				padding: "4px 12px",
				borderRadius: "6px",
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "transparent",
				color: "var(--dsw-alias-label-secondary)",
				cursor: "pointer",
				fontSize: "12px"
			};

			const doctorData = doctor.data;
			const doctorLine =
				doctorData === null
					? null
					: doctorData.errors.length === 0 && doctorData.warnings.length === 0
						? t("doctor.clean")
						: t("doctor.summary", { e: doctorData.errors.length, w: doctorData.warnings.length });

			return h("div", {
				style: {
					height: "100%",
					overflow: "auto",
					padding: "18px 22px 28px",
					display: "flex",
					flexDirection: "column",
					gap: "14px"
				},
				children: [
					// header
					h("div", {
						style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
						children: [
							h("div", { style: { ...S.title, fontSize: "16px" }, children: t("dialog.title") }),
							state.workspaces.length > 0 &&
								h("select", {
									"aria-label": t("dialog.workspace"),
									value: state.selected ?? "",
									onChange: (event) => pickWorkspace(event.target.value),
									style: {
										padding: "4px 8px",
										borderRadius: "6px",
										border: "1px solid var(--dsw-alias-border-l2)",
										background: "var(--dsw-alias-bg-layer-2)",
										color: "var(--dsw-alias-label-primary)",
										fontSize: "12px",
										maxWidth: "300px"
									},
									children: state.workspaces.map((entry) =>
										h("option", { key: entry.id, value: entry.id, children: entry.title || entry.path })
									)
								}),
							h("div", { style: { flex: 1 } }),
							h("button", { type: "button", onClick: () => void refresh(), style: buttonStyle, children: t("dialog.refresh") })
						]
					}),
					selected !== null &&
						h("div", {
							title: selected.path,
							style: { ...S.mono, color: "var(--dsw-alias-label-tertiary)", overflowWrap: "anywhere" },
							children: selected.displayPath ?? selected.path
						}),

					// next step
					stage !== null &&
						h("div", {
							style: {
								border: "1px solid var(--dsw-alias-border-l2)",
								borderRadius: "8px",
								padding: "12px 14px",
								background: "var(--dsw-alias-bg-layer-2)",
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							},
							children: [
								h("div", {
									style: { ...S.title, fontSize: "14px" },
									children: t("cycle.stage", { n: stage.n, title: stage.title })
								}),
								h("div", { style: S.body, children: stage.detail }),
								h("div", {
									style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
									children: [
										h("button", {
											type: "button",
											onClick: copyPrompt,
											style: {
												padding: "5px 13px",
												borderRadius: "7px",
												border: "1px solid transparent",
												background: "var(--dsw-alias-state-business-primary)",
												color: "var(--dsw-alias-label-primary-inverted, #fff)",
												cursor: "pointer",
												fontSize: "12.5px",
												fontWeight: 500
											},
											children: copied === "prompt" ? t("cycle.copied") : t("cycle.copy")
										}),
										h("span", {
											style: S.label,
											children: stage.actor === "human" ? t("cycle.human") : t("cycle.agent")
										})
									]
								})
							]
						}),

					// the mockup under review
					reviewTarget !== null &&
						h("div", {
							style: {
								border: "1px solid var(--dsw-alias-border-l2)",
								borderRadius: "8px",
								overflow: "hidden",
								background: "var(--dsw-alias-bg-layer-1)"
							},
							children: [
								h("div", {
									style: { padding: "10px 14px", borderBottom: "1px solid var(--dsw-alias-border-l2)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
									children: [
										h("div", { style: { ...S.title, fontSize: "13px" }, children: t("mockup.review") }),
										reviewTarget.taskId &&
											h("code", { style: { ...S.mono }, children: reviewTarget.taskId }),
										h("code", { style: { ...S.mono }, children: reviewTarget.file }),
										h("div", { style: { flex: 1 } }),
										// Approval is not a button here. The agent asks with
										// ask_user_question, so the request arrives in the chat
										// with its context, and `opc approve` records the answer.
										h("span", { style: { ...S.label, color: "var(--dsw-alias-label-tertiary)" }, children: t("mockup.hint") })
									]
								}),
								reviewTarget.record !== undefined &&
									reviewTarget.record !== null &&
									String(reviewTarget.record.question ?? "").trim() &&
									String(reviewTarget.record.answer ?? "").trim() &&
									h("div", {
										style: { padding: "8px 14px 0", display: "flex", flexDirection: "column", gap: "2px" },
										children: [
											h("div", { style: S.label, children: `${t("mockup.asked")}: ${reviewTarget.record.question}` }),
											h("div", { style: S.label, children: `${t("mockup.answered")}: ${reviewTarget.record.answer}` })
										]
									}),
								(reviewTarget.record === undefined ||
									reviewTarget.record === null ||
									!String(reviewTarget.record.question ?? "").trim() ||
									!String(reviewTarget.record.answer ?? "").trim()) &&
									h("div", { style: { padding: "8px 14px 0", ...S.label }, children: t("mockup.noAnswer") }),
								["unrecorded", "rejected", "stale"].includes(reviewTarget.reason) &&
									h("div", {
										style: { padding: "8px 14px 0", ...S.label, color: "var(--dsw-alias-state-warn-label, var(--dsw-alias-state-error-primary))" },
										children: t(`mockup.${reviewTarget.reason}`)
									}),
								h("div", { style: { padding: "10px 14px 14px" }, children:
									mockup.status === "loading"
										? h("div", { style: S.label, children: t("mockup.loading") })
										: mockup.status === "failed"
											? h("div", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" }, children: `${t("mockup.failed")}: ${mockup.error}` })
											: mockup.tooLarge
												? h("div", { style: S.label, children: t("mockup.tooLarge") })
												: h("iframe", {
														title: t("mockup.review"),
														srcDoc: mockup.html,
														sandbox: "allow-scripts allow-forms",
														style: {
															width: "100%",
															height: "540px",
															border: "1px solid var(--dsw-alias-border-l2)",
															borderRadius: "6px",
															background: "#fff"
														}
													})
								}),

							]
						}),


					// every mockup with the conversation that approved it. An approval
					// is checkable only if the question and the answer are readable —
					// including when the approval holds, when there is no pending card.
					mockups.length > 0 &&
						h("div", {
							style: {
								border: "1px solid var(--dsw-alias-border-l2)",
								borderRadius: "8px",
								padding: "10px 14px",
								display: "flex",
								flexDirection: "column",
								gap: "6px"
							},
							children: [
								h("div", { style: { ...S.title, fontSize: "13px" }, children: t("approvals.title") }),
								...mockups.map((entry) =>
									h("div", {
										key: `${entry.file}:${entry.taskId}`,
										style: { display: "flex", flexDirection: "column", gap: "2px" }
									}, [
										h("div", {
											style: { ...S.label, display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }
										}, [
											h("code", { style: S.mono, children: entry.file }),
											entry.taskId && h("code", { style: S.mono, children: entry.taskId }),
											h("span", {
												style: {
													color: entry.ok
														? "var(--dsw-alias-state-success-primary)"
														: "var(--dsw-alias-state-warn-label, var(--dsw-alias-label-tertiary))"
												},
												children: t(`approvals.${entry.ok ? "approved" : entry.reason || "unsigned"}`)
											})
										]),
										entry.record && String(entry.record.question ?? "").trim() && String(entry.record.answer ?? "").trim()
											? h("div", {
													style: S.label,
													children: `${t("mockup.asked")}: ${entry.record.question} · ${t("mockup.answered")}: ${entry.record.answer}`
												})
											: h("div", { style: S.label, children: t("mockup.noAnswer") })
									])
								)
							]
						}),


					// checks
					selected !== null &&
						selected.hasCompany &&
						h("div", {
							style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
							children: [
								h("button", {
									type: "button",
									disabled: doctor.status === "running",
									onClick: () => void run(),
									style: buttonStyle,
									children: doctor.status === "running" ? t("doctor.running") : t("doctor.run")
								}),
								doctorLine !== null &&
									h("span", {
										style: {
											...S.label,
											color:
												doctorData.errors.length === 0
													? "var(--dsw-alias-state-success-primary)"
													: "var(--dsw-alias-state-error-primary)"
										},
										children: doctorLine
									}),
								doctor.status === "failed" &&
									h("span", {
										style: { ...S.label, color: "var(--dsw-alias-state-error-primary)" },
										children: `${t("doctor.failed")}: ${doctor.error}`
									})
							]
						}),
					doctorData !== null &&
						h("div", {
							style: { display: "flex", flexDirection: "column", gap: "3px", marginTop: "-6px" },
							children: [...doctorData.errors, ...doctorData.warnings].slice(0, 6).map((issue, index) =>
								h("div", {
									key: `issue-${index}`,
									style: {
										...S.label,
										color: index < doctorData.errors.length
											? "var(--dsw-alias-state-error-primary)"
											: "var(--dsw-alias-state-warn-label, var(--dsw-alias-label-tertiary))"
									},
									children: issue
								})
							)
						}),

					// body
					state.status === "loading" && h("div", { style: S.label, children: t("dialog.loading") }),
					state.status === "failed" &&
						h("div", {
							role: "alert",
							style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" },
							children: `${t("dialog.failed")}: ${state.error}`
						}),
					state.status === "ready" &&
						(selected !== null
							? h(WorkspaceBoard, {
									entry: selected,
									t,
									copied,
									onBootstrap: (id) => bootstrapWorkspace(id),
									onRefresh: () => void refresh(),
									onCopy: (path) => {
										void navigator.clipboard?.writeText(path);
										setCopied(path);
									}
								})
							: h("div", { style: S.label, children: t("dialog.empty") }))
				]
			});
		}

		/** The sidebar row's icon. A 3×3 grid reads as "board" at 16px. */
		function OpcBoardPanelIcon(props) {
			const size = props.size ?? 16;
			return h("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [0, 1, 2].flatMap((row) =>
					[0, 1, 2].map((col) =>
						h("rect", {
							key: `${row}-${col}`,
							x: 1.5 + col * 5,
							y: 1.5 + row * 5,
							width: 3,
							height: 3,
							rx: 0.7,
							fill: "currentColor",
							opacity: row === 0 && col === 0 ? 1 : 0.5
						})
					)
				)
			});
		}

		/** Required Client services. */
		const inject = ["slots", "locale", "connection"];

		/**
		 * @param {object} ctx - Client root context.
		 * @returns {void}
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "one-person-company: dictionaries");

			// Slot labels are resolved outside a component, so the dictionary needs
			// a bound translator rather than a `t` prop.
			const t = ctx.locale.bind(NS);

			const injected = () => ({
				t,
				loadBoard: () => callHost(ctx, "list"),
				bootstrapWorkspace: (id) => callHost(ctx, "bootstrap", { id }),
				loadCycle: (id) => callHost(ctx, "cycle", { id }),
				runDoctor: (id) => callHost(ctx, "doctor", { id }),
				loadDesign: (id, file) => callHost(ctx, "design", { id, file })
			});

			// The sidebar row. `order: 20` puts it after Plugins (0) and
			// Automation tasks (10); the sidebar collects these rows itself, so a
			// slot the deployment does not mount is a no-op rather than an error.
			ctx.effect(
				() =>
					ctx.slots.inject("sidebar.panellist", () =>
						ctx.slots.register(
							{
								name: "sidebar.panellist",
								id: PANEL_ID,
								order: 20,
								label: () => t("panel.label"),
								locale: NS
							},
							OpcBoardPanelIcon
						)
					),
				"one-person-company: sidebar row"
			);

			// The page the row selects. Keyed by the same panel id, which is what
			// the `main` slot dispatches on.
			ctx.effect(
				() =>
					ctx.slots.inject("main", () =>
						ctx.slots.register(
							{
								name: "main",
								key: PANEL_ID,
								locale: NS,
								inject: injected
							},
							OpcBoardPage
						)
					),
				"one-person-company: board page"
			);
		}


		exports.inject = inject;
		exports.apply = apply;
		exports.OpcBoardPage = OpcBoardPage;
		exports.PANEL_ID = PANEL_ID;
		return module.exports;
	}
});

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

		/**
		 * Simplified Chinese dictionary. DSH ships `zh` as Simplified; a separate
		 * `dsh-zh-hant` pack converts every bundle's `zh` dictionary to
		 * Traditional. Writing Traditional here would show Traditional text to
		 * Simplified users and make that conversion a no-op.
		 */
		const zh = {
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
			"col.id": "编号",
			"col.status": "状态",
			"col.priority": "优先",
			"col.owner": "负责",
			"col.title": "任务",
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

		/** The dialog body for one workspace. */
		function WorkspaceBoard(props) {
			const { entry, t, onCopy, copied } = props;
			if (!entry.hasCompany) {
				return h("div", {
					style: { padding: "18px 4px" },
					children: [
						h("div", { style: S.body, children: t("dialog.noCompany") }),
						h("div", { style: { ...S.label, marginTop: "6px" }, children: t("dialog.bootstrapHint") }),
						h("div", {
							style: { display: "flex", gap: "8px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" },
							children: [
								h("code", {
									title: entry.path,
									style: { ...S.mono, overflowWrap: "anywhere" },
									children: entry.displayPath ?? entry.path
								}),
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
						})
					]
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
					h(TaskTable, { t, tasks: entry.tasks })
				]
			});
		}

		/** The click target in the sidebar footer. */
		function OpcBoardButton(props) {
			const { wide, t, loadBoard } = props;
			const [open, setOpen] = react.useState(false);
			const [state, setState] = react.useState({ status: "idle", workspaces: [], selected: null, error: null });
			const [copied, setCopied] = react.useState(null);

			const refresh = react.useCallback(async () => {
				setState((current) => ({ ...current, status: "loading", error: null }));
				try {
					const result = await loadBoard();
					setState((current) => {
						const workspaces = result?.workspaces ?? [];
						const keep = workspaces.find((entry) => entry.id === current.selected)?.id;
						const preferred =
							keep ??
							workspaces.find((entry) => entry.hasCompany)?.id ??
							workspaces[0]?.id ??
							null;
						return { status: "ready", workspaces, selected: preferred, error: null };
					});
				} catch (error) {
					setState({ status: "failed", workspaces: [], selected: null, error: String(error?.message ?? error) });
				}
			}, [loadBoard]);

			// Re-read on every open so the board is never a stale snapshot.
			react.useEffect(() => {
				if (open) void refresh();
			}, [open, refresh]);

			react.useEffect(() => {
				if (!open) return undefined;
				const onKey = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [open]);

			const selected = state.workspaces.find((entry) => entry.id === state.selected) ?? null;

			const overlay = open
				? h("div", {
						role: "dialog",
						"aria-modal": "true",
						"aria-label": t("dialog.title"),
						style: {
							position: "fixed",
							inset: 0,
							zIndex: 2147483000,
							background: "rgba(0,0,0,0.42)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "24px"
						},
						onClick: (event) => {
							if (event.target === event.currentTarget) setOpen(false);
						},
						children: h("div", {
							style: {
								width: "min(1000px, 100%)",
								maxHeight: "86vh",
								display: "flex",
								flexDirection: "column",
								background: "var(--dsw-alias-bg-layer-1)",
								border: "1px solid var(--dsw-alias-border-l2)",
								borderRadius: "12px",
								boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
								overflow: "hidden"
							},
							children: [
								h("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "12px 14px",
										borderBottom: "1px solid var(--dsw-alias-border-l2)",
										flexWrap: "wrap"
									},
									children: [
										h("div", { style: S.title, children: t("dialog.title") }),
										state.workspaces.length > 1 &&
											h("select", {
												"aria-label": t("dialog.workspace"),
												value: state.selected ?? "",
												onChange: (event) => setState((current) => ({ ...current, selected: event.target.value })),
												style: {
													marginLeft: "6px",
													padding: "3px 8px",
													borderRadius: "6px",
													border: "1px solid var(--dsw-alias-border-l2)",
													background: "var(--dsw-alias-bg-layer-2)",
													color: "var(--dsw-alias-label-primary)",
													fontSize: "12px",
													maxWidth: "280px"
												},
												children: state.workspaces.map((entry) =>
													h("option", { key: entry.id, value: entry.id, children: entry.title || entry.path })
												)
											}),
										h("div", { style: { flex: 1 } }),
										h("button", {
											type: "button",
											onClick: () => void refresh(),
											style: {
												padding: "4px 10px",
												borderRadius: "6px",
												border: "1px solid var(--dsw-alias-border-l2)",
												background: "transparent",
												color: "var(--dsw-alias-label-secondary)",
												cursor: "pointer",
												fontSize: "12px"
											},
											children: t("dialog.refresh")
										}),
										h("button", {
											type: "button",
											onClick: () => setOpen(false),
											"aria-label": t("dialog.close"),
											style: {
												padding: "4px 10px",
												borderRadius: "6px",
												border: "1px solid var(--dsw-alias-border-l2)",
												background: "transparent",
												color: "var(--dsw-alias-label-secondary)",
												cursor: "pointer",
												fontSize: "12px"
											},
											children: "✕"
										})
									]
								}),
								selected !== null &&
									h("div", {
										// The home directory is collapsed to `~` so the dialog can be
										// screenshotted or screen-shared without carrying a user name.
										// The absolute path stays in the title attribute.
										title: selected.path,
										style: { padding: "8px 14px 0", ...S.mono, overflowWrap: "anywhere" },
										children: selected.displayPath ?? selected.path
									}),
								h("div", {
									style: { padding: "12px 14px 16px", overflow: "auto" },
									children:
										state.status === "loading"
											? h("div", { style: S.label, children: t("dialog.loading") })
											: state.status === "failed"
												? h("div", {
														role: "alert",
														style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" },
														children: `${t("dialog.failed")}: ${state.error}`
													})
												: selected !== null
													? h(WorkspaceBoard, {
															entry: selected,
															t,
															copied,
															onCopy: (path) => {
																void navigator.clipboard?.writeText(path);
																setCopied(path);
															}
														})
													: h("div", { style: S.label, children: t("dialog.empty") })
								})
							]
						})
					})
				: null;

			return h(jsx_runtime.Fragment, {
				children: [
					h("button", {
						type: "button",
						"aria-label": t("button.aria"),
						title: t("button.aria"),
						onClick: () => setOpen(true),
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "6px",
							width: "100%",
							padding: wide ? "5px 8px" : "5px 0",
							borderRadius: "7px",
							border: "1px solid transparent",
							background: "transparent",
							color: "var(--dsw-alias-label-secondary)",
							cursor: "pointer",
							fontSize: "12px"
						},
						onMouseEnter: (event) => {
							event.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)";
						},
						onMouseLeave: (event) => {
							event.currentTarget.style.background = "transparent";
						},
						children: [
							// A 3×3 grid glyph: reads as "board" at 13px and needs no icon import.
							h("svg", {
								width: 13,
								height: 13,
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
											opacity: row === 0 && col === 0 ? 1 : 0.45
										})
									)
								)
							}),
							wide ? h("span", { children: t("button.label") }) : null
						]
					}),
					// Rendered inline, not portalled: the `react` shim the client
					// runtime hands a plugin exposes hooks but not `createPortal`.
					// The overlay is `position: fixed` with a top-layer z-index, which
					// is enough as long as no ancestor of the footer transforms.
					overlay
				]
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

			const injected = () => ({ loadBoard: () => callHost(ctx, "list") });

			// `slots.inject(name, factory)` is not optional. It defers the
			// registration until the slot exists in the composed layout; calling
			// `slots.register` directly at apply time throws for a slot the
			// deployment has not mounted yet, and a throw here fails the whole
			// client entry — which takes the GUI down with it. A refused seat is
			// therefore caught and downgraded to a warning.
			ctx.effect(
				() =>
					ctx.slots.inject("sidebar.footer.action", () => {
						try {
							return ctx.slots.register(
								{
									name: "sidebar.footer.action",
									// A list slot keys its occupants: without an id the
									// registry throws "list slot … requires options.id".
									id: "one-person-company",
									locale: NS,
									inject: injected
								},
								OpcBoardButton
							);
						} catch (error) {
							console.warn(`one-person-company: could not take the sidebar.footer.action seat — ${String(error)}`);
							return () => {};
						}
					}),
				"one-person-company: sidebar footer button"
			);
		}

		exports.inject = inject;
		exports.apply = apply;
		exports.OpcBoardButton = OpcBoardButton;
		return module.exports;
	}
});

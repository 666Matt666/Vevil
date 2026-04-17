# Vercel Composition Patterns (Skill Completo)

Fuente: https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns
Repositorio: https://github.com/vercel-labs/agent-skills

## Overview

React composition patterns for scaling components without boolean prop explosion. Focus on compound components, context providers, lifting state, and explicit variants. Includes React 19-specific guidance.

## 1. The Boolean Prop Problem

### Anti-pattern: Boolean Proliferation

As components grow, boolean props multiply:

```typescript
// Before: 5 boolean flags
<Table
  striped={true}
  bordered={false}
  condensed={true}
  hoverable={true}
  responsive={true}
/>
// Adding a new feature means adding another boolean
<Table stickyHeader={true} /> // <- boolean #6
```

**Problems**:
- API becomes unwieldy
- All combinations must be tested
- Implementation complexity grows exponentially
- Hard to understand what combinations are valid

### Solution: Composition

```typescript
// After: Composed components
<Table.Container>
  <Table striped hoverable>
    <Table.Header sticky>...</Table.Header>
    <Table.Body>...</Table.Body>
  </Table>
</Table.Container>
```

## 2. Compound Components Pattern

### Structure
Compound components share implicit state via React Context. They:
- Know about each other (they're related)
- Communicate through shared context
- Can be arranged in flexible hierarchies

**Example from Radix UI**:
```typescript
<Tabs defaultValue="tab1">
  <Tabs.List>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>
```

### Benefits
- Layout flexibility: parent controls structure, children fill slots
- Implicit state sharing: no prop drilling
- Discoverable API: IDE autocomplete shows available sub-components

### Implementation
```typescript
// Tabs.tsx
const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  const context = useTabsContext();
  return <div role="tablist">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};
```

## 3. State Management with Providers

### Pattern: Separate "State Provider" from "UI Component"

**Problem**: Components with complex state logic mix business logic with UI.

```typescript
// ❌ Monolithic component
function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { fetchInvoices(); fetchCustomers(); }, []);
  
  // 200 lines of rendering logic below...
}
```

**Solution**: Extract state provider.

```typescript
// ✅ Split: provider + consumer
// InvoiceProvider.tsx
export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  
  const value = useMemo(() => ({
    invoices, setInvoices,
    customers, setCustomers,
    selectedCustomer, setSelectedCustomer,
    refresh: async () => { ... }
  }), [invoices, customers, selectedCustomer]);
  
  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
};

// InvoiceList.tsx (child)
export const InvoiceList: React.FC = () => {
  const { invoices, customers } = useInvoiceContext(); // Clean injection
  return <Table data={invoices} />;
};
```

### Benefits
- Testability: test provider logic separately from UI
- Reusability: multiple consumers can access state
- Separation of concerns: state logic isolated

## 4. Explicit Variants Pattern

### Instead of many booleans, define "modes" as variants

```typescript
// ❌ Boolean flags
<Button
  primary={true}
  large={false}
  disabled={false}
/>

// ✅ Single variant (union type)
<Button variant="primary-large" /> // or
<Button variant="secondary-small" />

// ✅ Or separate components
<PrimaryButton size="large" />
<SecondaryButton size="small" />
```

**Vevil example** (button styles already use this pattern):
```typescript
// Different color schemes = implicit variants
<button style={{ backgroundColor: '#6366f1' }}> // Primary
<button style={{ backgroundColor: '#f59e0b' }}> // Warning
<button style={{ backgroundColor: '#22c55e' }}> // Success
<button style={{ backgroundColor: '#dc2626' }}> // Danger
```

**Improvement**: Extract to variant component factory:
```typescript
const ButtonVariant = {
  Primary: (props: ButtonProps) => <Button {...props} variant="primary" />,
  Success: (props: ButtonProps) => <Button {...props} variant="success" />,
  Warning: (props: ButtonProps) => <Button {...props} variant="warning" />,
  Danger: (props: ButtonProps) => <Button {...props} variant="danger" />,
};
```

## 5. Children Over Render Props

### Render prop anti-pattern

```typescript
// ❌ Inverted control; awkward to use
<DataFetcher
  url="/api/invoices"
  render={(data) => <InvoiceTable data={data} />}
  loadingFallback={<Spinner />}
  errorFallback={(err) => <Error error={err} />}
/>
```

### Composition pattern (preferred)

```typescript
// ✅ Direct composition; more natural JSX
<DataFetcher url="/api/invoices">
  {(data) => <InvoiceTable data={data} />}
  {(isLoading) => isLoading && <Spinner />}
  {(error) => error && <Error error={error} />}
</DataFetcher>

// Or even cleaner with separate slot components
<DataFetcher url="/api/invoices">
  <DataFetcher.Content>
    <InvoiceTable />
  </DataFetcher.Content>
  <DataFetcher.Loading>
    <Spinner />
  </DataFetcher.Loading>
</DataFetcher>
```

## 6. Lifting State

### Move state up to nearest common ancestor

**Before** (state duplicated):
```typescript
function Page() {
  return (
    <>
      <FilterPanel /> // Owns its filter state
      <DataTable />   // Owns its own filter state (separate!)
      // Filtering each independently -> sync issues
    </>
  );
}
```

**After** (state lifted):
```typescript
function Page() {
  const [filters, setFilters] = useState<FilterState>({});
  return (
    <>
      <FilterPanel filters={filters} onChange={setFilters} />
      <DataTable filters={filters} />
    </>
  );
}
```

**Vevil current state**: `AccountsReceivable` component contains:
- Customers list
- Selected customer
- Payment form
- Invoice list

**Could extract**:
1. `CustomerList` (state: own internal selection)
2. `CustomerDetail` (receives `customerId` prop; independent)
3. Not necessary to lift state; current coupling acceptable for now.

**Consider lifting state when**:
- Two+ siblings need same state
- State updates must stay in sync
- User expects changes in one place to reflect in another

## 7. React 19 Specifics

### `forwardRef` Removal
In React 19, `forwardRef` is no longer needed. Refs are automatically forwarded.

```typescript
// React 18
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <button ref={ref} {...props} />
));

// React 19 - simpler
const Button = (props: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => (
  <button {...props} />
);
```

### `use()` - Async Context
```typescript
// React 18: useContext() for sync data only
const user = useContext(UserContext);

// React 19: use() supports promises
const user = use(userPromise); // Suspends until resolved
// Enables data fetching patterns without useEffect
```

**Vevil status**: Using React 18 (package.json: `"react": "^18.3.1"`). Plan upgrade to React 19 after migration.

## 8. Checklist for Refactoring

**Before refactoring a component**:
- [ ] Identify boolean props (flag combinations)
- [ ] Can they become compound components or variants?
- [ ] Is state duplicated across siblings? → Lift to parent or context
- [ ] Are there render props? → Convert to children pattern
- [ ] Is the component too large? → Extract subcomponents
- [ ] Are consumers passing many props? → Consider context

**After refactoring**:
- [ ] All existing usage still works
- [ ] TypeScript types are correct
- [ ] No regressions in existing tests
- [ ] New tests for extracted components
- [ ] Documentation updated (if library)

## Vevil Component Inventory

### Large Components (candidates for extraction)

| Component | Lines | Candidates for extraction |
|-----------|-------|--------------------------|
| `AccountsReceivable.tsx` | 719 | `CustomerList`, `CustomerDetail`, `PaymentModal` |
| `InvoiceList.tsx` | 1546 | `InvoiceFilters`, `InvoiceTable`, `InvoiceModal`, `InvoiceActions` |
| `Products.tsx` | ~800 | `ProductTable`, `StockMovements`, `ProductForm` |
| `Layout.tsx` | 621 | `Sidebar`, `MobileHeader`, `CurrencyRatesBar` (already separate) |

### Refactoring Phases

**Phase 1 (Low risk)**:
- Extract pure presentational components (no state)
- Example: `CustomerListItem` from `AccountsReceivable`

**Phase 2 (Medium risk)**:
- Extract stateful components with their own hooks
- Example: `useInvoiceFilters` custom hook

**Phase 3 (High value)**:
- Introduce context for global state (dashboard metrics, user profile already via React Query)
- Compound components for common UI patterns (Modal, Dropdown, Tabs if needed)

## References

Full skill documentation: `vevil-system/docs/cursor-skills/vercel-composition-patterns/SKILL.md`  
Online: https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns

Related:
- `vercel-react-best-practices` (performance: memo, useMemo, useCallback)
- `frontend-design` (UI/UX patterns)
- `systematic-debugging` (refactoring methodology)

---

**Skill ID**: `vercel-composition-patterns`  
**Priority**: P2 (incremental refactoring)  
**Effort**: 2-3 sprints to fully apply  
**Risk**: Low (extract, don't rewrite)

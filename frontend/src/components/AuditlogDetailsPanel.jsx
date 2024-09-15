import { useMemo, useState } from 'react';
import SideBar from "../components/admin/SideBar";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Alert, CircularProgress, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

const DetailPanel = ({ row }) => {
  const {
    data: auditInfo,
    isLoading,
    isError,
  } = useFetchAuditLogById(
    {
      id: row.id,
    },
    {
      enabled: row.getIsExpanded(),
    }
  );

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error Loading Audit Info</Alert>;

  const { description, status, ipAddress, timestamp } = auditInfo || {};

  return (
    <Stack gap="0.5rem" minHeight="100px">
      <div>
        <b>Description:</b> {description}
      </div>
      <div>
        <b>Status:</b> {status}
      </div>
      <div>
        <b>IP Address:</b> {ipAddress}
      </div>
      <div>
        <b>Timestamp:</b> {new Date(timestamp).toLocaleString()}
      </div>
    </Stack>
  );
};

const Example = () => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { data: auditsData = [], isError, isRefetching, isLoading } = useFetchAudits({
    columnFilters,
    globalFilter,
    pagination,
    sorting,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
      },
      {
        accessorKey: 'userName',
        header: 'User Name',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
      },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: auditsData || [],
    getRowId: (row) => row._id,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiExpandButtonProps: ({ row }) => ({
      children: row.getIsExpanded() ? <MinusIcon /> : <AddIcon />,
    }),
    muiToolbarAlertBannerProps: isError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderDetailPanel: ({ row }) => <DetailPanel row={row} />,
    rowCount: auditsData?.length || 0,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const ExampleWithReactQueryProvider = () => (
  <QueryClientProvider client={queryClient}>
    <div className="flex">
      {/* Smaller Sidebar */}
      <div className="sidebar" style={{ width: '300px' }}>
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="content" style={{ flex: 1 }}>
        <Example />
      </div>
    </div>
  </QueryClientProvider>
);

export default ExampleWithReactQueryProvider;


const useFetchAudits = ({
  columnFilters,
  globalFilter,
  pagination,
  sorting,
}) => {
  return useQuery({
    queryKey: [
      'audits',
      columnFilters,
      globalFilter,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const fetchURL = new URL(
        '/api/audits',
        process.env.NODE_ENV === 'production'
          ? 'https://your-production-api-url.com'
          : 'http://localhost:3000'
      );

      fetchURL.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
      fetchURL.searchParams.set('size', `${pagination.pageSize}`);
      fetchURL.searchParams.set('filters', JSON.stringify(columnFilters || []));
      fetchURL.searchParams.set('globalFilter', globalFilter || '');
      fetchURL.searchParams.set('sorting', JSON.stringify(sorting || []));

      const response = await fetch(fetchURL.href);
      const json = await response.json();
      return json;
    },
  });
};


const useFetchAuditLogById = (params, options) => {
  return useQuery({
    enabled: options.enabled,
    queryKey: ['auditLog', params.id],
    queryFn: async () => {
      const fetchURL = new URL(
        `/api/audits/${params.id}`,
        process.env.NODE_ENV === 'production'
          ? 'https://your-production-api-url.com'
          : 'http://localhost:3000'
      );
      const response = await fetch(fetchURL.href);
      const json = await response.json();
      return json;
    },
  });
};

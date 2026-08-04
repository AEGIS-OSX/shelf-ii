import BookCover from '@/components/BookCover';
import BookRow from '@/components/BookRow';
import EmptyState from '@/components/EmptyState';
import SearchInput from '@/components/SearchInput';
import StatusTab from '@/components/StatusTab';
import ThemeProvider from '@/components/ThemeProvider';
import TopBar from '@/components/TopBar';
import DataTable from '@/components/ui/data-table';
import Sidebar from '@/components/ui/sidebar';

export default function Home() {
  return (
    <ThemeProvider>
      <main>
        <TopBar />
        <Sidebar />
        <StatusTab />
        <SearchInput />
        <BookRow />
        <BookCover />
        <EmptyState />
        <DataTable />
      </main>
    </ThemeProvider>
  );
}

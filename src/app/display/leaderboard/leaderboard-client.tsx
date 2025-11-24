'use client';

import type { Stock } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Edit, Trash2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import { EditStockDialog } from './edit-stock-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

/**
 * The client component for the Leaderboard page.
 * It fetches all stock data from Firestore in real-time and displays them
 * in an alphabetized list, including controls for editing and deleting stocks.
 * @returns {JSX.Element} The rendered leaderboard client component.
 */
export default function LeaderboardClient() {
  const { firestore } = useFirebase();
  const titlesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'titles') : null, [firestore]);
  const { data: stocks } = useCollection<Stock>(titlesCollection);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const { toast } = useToast();
  
  // Sort stocks alphabetically by nickname.
  const sortedStocks = stocks ? [...stocks].sort((a, b) => a.nickname.localeCompare(b.nickname)) : [];

  const handleDelete = (stockId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'titles', stockId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Titel gelöscht',
      description: 'Der Titel wurde erfolgreich vom Markt entfernt.',
    });
  };

  return (
    <div className="h-full flex flex-col p-4 bg-black text-gray-200 overflow-hidden">
      <h1 className="text-3xl font-bold text-center mb-4 text-white">Rangliste & Verwaltung</h1>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-full">
            {sortedStocks.map((stock) => {
              const isPositive = stock.percentChange >= 0;
              
              return (
                <div
                  key={stock.id}
                  className="grid grid-cols-[1fr_100px_80px_60px] items-center gap-3 p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-base"
                >
                  <div className='flex flex-col overflow-hidden'>
                    <span className="font-bold text-white truncate">{stock.nickname}</span>
                    <span className="text-xs font-mono text-gray-400">{stock.ticker}</span>
                  </div>
                  <span className={cn(
                      'font-mono font-bold text-right',
                      isPositive ? 'text-green-400' : 'text-red-500'
                    )}>
                    {stock.currentValue.toFixed(2)}
                  </span>
                  <div className={cn(
                      'flex items-center justify-end gap-1 font-bold',
                       isPositive ? 'text-green-400' : 'text-red-500'
                    )}>
                    {stock.percentChange !== 0 && (
                      isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                    <span>
                      {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingStock(stock)} className="p-1 text-gray-400 hover:text-white transition-colors">
                      <Edit size={16} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bist du dir absolut sicher?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Titel "{stock.nickname}" dauerhaft gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(stock.id)}>
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {editingStock && (
        <EditStockDialog
          stock={editingStock}
          isOpen={!!editingStock}
          onClose={() => setEditingStock(null)}
        />
      )}
    </div>
  );
}

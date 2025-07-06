import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-cava-primary">
              Visit Calendar Instructions
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-bold text-cava-primary mb-2">1. Setup Your Profile</h3>
            <p>Enter your name and the number of restaurants in your garden. Restaurant name fields will appear automatically.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-primary mb-2">2. Generate Visit Tiles</h3>
            <p>Click "Generate Visits" to create visit tiles based on the current period's requirements. Different visit types are available for different periods.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-primary mb-2">3. Drag and Drop Scheduling</h3>
            <p>Drag visit tiles from the left Visit Bank to the calendar grid on the right. Tiles will expand to fill their required time duration.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-primary mb-2">4. Period Navigation</h3>
            <p>Use the period tabs (P1-P13) to switch between different fiscal periods. Your scheduled visits are saved for each period.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-primary mb-2">5. Visit Types & Duration</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Quality Restaurant Audit (QRA):</strong> 5 hours - Periods 1, 5, 8, 11 only</li>
              <li><strong>Coaching Visit:</strong> 2 hours - Periods 2, 3, 4, 6, 7, 9, 10, 12, 13</li>
              <li><strong>Cash Audit:</strong> 1 hour - All periods</li>
              <li><strong>GM Impact Plan:</strong> 1 hour - All periods</li>
              <li><strong>Guest Experience:</strong> 1.5 hours - All periods</li>
              <li><strong>Station Training:</strong> 2 hours - All periods (one per period)</li>
              <li><strong>Competency Champion:</strong> 1 hour - All periods (one per period)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-primary mb-2">6. Calendar Features</h3>
            <p>The calendar shows four weeks per period with hourly time slots from 8 AM to 10 PM. Visit tiles cannot overlap - ensure time slots are available before scheduling.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-cava-error mb-2">7. Reset Calendar</h3>
            <p>Use the "Reset Calendar" button to clear all scheduled visits for the current period. This action cannot be undone.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

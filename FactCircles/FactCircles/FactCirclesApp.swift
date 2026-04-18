//
//  FactCirclesApp.swift
//  FactCircles
//
//  Created by Apple on 17/04/26.
//

import SwiftUI
import CoreData

@main
struct FactCirclesApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
